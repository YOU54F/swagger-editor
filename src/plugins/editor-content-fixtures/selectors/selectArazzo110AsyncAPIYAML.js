const selectArazzo110AsyncAPIYAML = () => `arazzo: 1.1.0
info:
  title: A pet purchasing workflow
  summary: Purchase a pet by combining OpenAPI calls with AsyncAPI messaging
  description: >-
    Searches for an available pet over HTTP, then places an order by sending a message on a Kafka
    channel and waits for the correlated confirmation message.
  version: 1.0.0
sourceDescriptions:
  - name: petStoreDescription
    url: https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml
    type: openapi
  - name: asyncOrderApiDescription
    url: https://raw.githubusercontent.com/OAI/Arazzo-Specification/main/examples/1.1.0/pet-asyncapi.yaml
    type: asyncapi
workflows:
  - workflowId: loginUserAndPurchasePet
    summary: Log in, find a pet and order it asynchronously
    inputs:
      type: object
      required:
        - username
        - password
        - orderCorrelationId
      properties:
        username:
          type: string
        password:
          type: string
        orderCorrelationId:
          type: string
    steps:
      - stepId: loginStep
        description: Log the user in
        operationId: $sourceDescriptions.petStoreDescription.loginUser
        parameters:
          - name: username
            in: query
            value: $inputs.username
          - name: password
            in: query
            value: $inputs.password
        successCriteria:
          - condition: $statusCode == 200
        outputs:
          sessionToken: $response.body
      - stepId: getPetStep
        description: Retrieve an available pet
        operationId: $sourceDescriptions.petStoreDescription.findPetsByStatus
        parameters:
          - name: status
            in: query
            value: available
          - name: Authorization
            in: header
            value: $steps.loginStep.outputs.sessionToken
        successCriteria:
          - condition: $statusCode == 200
        onSuccess:
          - name: noPetsAvailable
            type: end
            criteria:
              - condition: $response.body#/0 == null
        outputs:
          petId: $response.body#/0/id
      - stepId: purchasePetStep
        description: Place the order by sending a message on the place-order channel
        operationId: $sourceDescriptions.asyncOrderApiDescription.placeOrder
        action: send
        parameters:
          - name: orderRequestId
            in: header
            value: $inputs.orderCorrelationId
        requestBody:
          contentType: application/json
          payload:
            petId: $steps.getPetStep.outputs.petId
      - stepId: confirmPetPurchaseStep
        description: Wait for the confirmation that carries the same correlation id
        channelPath: '{$sourceDescriptions.asyncOrderApiDescription.url}#/channels/confirm-order'
        action: receive
        correlationId: $inputs.orderCorrelationId
        timeout: 6000
        outputs:
          orderId: $message.payload.orderId
    outputs:
      orderId: $steps.confirmPetPurchaseStep.outputs.orderId
`;

export default selectArazzo110AsyncAPIYAML;
