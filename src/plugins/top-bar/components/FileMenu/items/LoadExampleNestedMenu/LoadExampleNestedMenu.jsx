import { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

import LoadExampleNestedMenuHandler from './LoadExampleNestedMenuHandler.jsx';

const LoadExampleNestedMenu = (props) => {
  const { getComponent } = props;
  const loadExampleNestedMenuHandler = useRef(null);
  const DropDownMenuNested = getComponent('DropdownMenuNested');
  const DropdownMenuItemDivider = getComponent('DropdownMenuItemDivider');
  const OpenAPI32PetstoreMenuItem = getComponent(
    'TopBarFileMenuLoadExampleNestedMenuOpenAPI32PetstoreMenuItem',
    true
  );
  const OpenAPI31PetstoreMenuItem = getComponent(
    'TopBarFileMenuLoadExampleNestedMenuOpenAPI31PetstoreMenuItem',
    true
  );
  const OpenAPI30PetstoreMenuItem = getComponent(
    'TopBarFileMenuLoadExampleNestedMenuOpenAPI30PetstoreMenuItem',
    true
  );
  const OpenAPI20PetstoreMenuItem = getComponent(
    'TopBarFileMenuLoadExampleNestedMenuOpenAPI20PetstoreMenuItem',
    true
  );
  const AsyncAPI26PetstoreMenuItem = getComponent(
    'TopBarFileMenuLoadExampleNestedMenuAsyncAPI26PetstoreMenuItem',
    true
  );
  const AsyncAPI30PetstoreMenuItem = getComponent(
    'TopBarFileMenuLoadExampleNestedMenuAsyncAPI30PetstoreMenuItem',
    true
  );
  const AsyncAPI26StreetlightsMenuItem = getComponent(
    'TopBarFileMenuLoadExampleNestedMenuAsyncAPI26StreetlightsMenuItem',
    true
  );
  const AsyncAPI30StreetlightsMenuItem = getComponent(
    'TopBarFileMenuLoadExampleNestedMenuAsyncAPI30StreetlightsMenuItem',
    true
  );
  const JSONSchema202012MenuItem = getComponent(
    'TopBarFileMenuLoadExampleNestedMenuJSONSchema202012MenuItem',
    true
  );
  const APIDesignSystemsMenuItem = getComponent(
    'TopBarFileMenuLoadExampleNestedMenuAPIDesignSystemsMenuItem',
    true
  );
  const Arazzo100PetstoreMenuItem = getComponent(
    'TopBarFileMenuLoadExampleNestedMenuArazzo100PetstoreMenuItem',
    true
  );
  const Arazzo100PetCouponsMenuItem = getComponent(
    'TopBarFileMenuLoadExampleNestedMenuArazzo100PetCouponsMenuItem',
    true
  );
  const Arazzo100OAuthMenuItem = getComponent(
    'TopBarFileMenuLoadExampleNestedMenuArazzo100OAuthMenuItem',
    true
  );
  const Arazzo100BNPLMenuItem = getComponent(
    'TopBarFileMenuLoadExampleNestedMenuArazzo100BNPLMenuItem',
    true
  );
  const Arazzo110AsyncAPIMenuItem = getComponent(
    'TopBarFileMenuLoadExampleNestedMenuArazzo110AsyncAPIMenuItem',
    true
  );
  const Arazzo100FAPIPARMenuItem = getComponent(
    'TopBarFileMenuLoadExampleNestedMenuArazzo100FAPIPARMenuItem',
    true
  );

  const handleOpenAPI32PetstoreClick = useCallback(async (event) => {
    await loadExampleNestedMenuHandler.current.loadOpenAP32PetstoreFixture(event);
  }, []);
  const handleOpenAPI31PetstoreClick = useCallback(async (event) => {
    await loadExampleNestedMenuHandler.current.loadOpenAP31PetstoreFixture(event);
  }, []);
  const handleOpenAPI30PetstoreClick = useCallback(async (event) => {
    await loadExampleNestedMenuHandler.current.loadOpenAP30PetstoreFixture(event);
  }, []);
  const handleOpenAPI20PetstoreClick = useCallback(async (event) => {
    await loadExampleNestedMenuHandler.current.loadOpenAP20PetstoreFixture(event);
  }, []);
  const handleAsyncAPI26PetstoreClick = useCallback(async (event) => {
    await loadExampleNestedMenuHandler.current.loadAsyncAPI26PetstoreFixture(event);
  }, []);
  const handleAsyncAPI30PetstoreClick = useCallback(async (event) => {
    await loadExampleNestedMenuHandler.current.loadAsyncAPI30PetstoreFixture(event);
  }, []);
  const handleAsyncAPI26StreetlightsClick = useCallback(async (event) => {
    await loadExampleNestedMenuHandler.current.loadAsyncAPI26StreetlightsFixture(event);
  }, []);
  const handleAsyncAPI30StreetlightsClick = useCallback(async (event) => {
    await loadExampleNestedMenuHandler.current.loadAsyncAPI30StreetlightsFixture(event);
  }, []);
  const handleJSONSchema202012Click = useCallback(async (event) => {
    await loadExampleNestedMenuHandler.current.loadJSONSchema202012Fixture(event);
  }, []);
  const handleAPIDesignSystemsClick = useCallback(async (event) => {
    await loadExampleNestedMenuHandler.current.loadAPIDesignSystemsFixture(event);
  }, []);
  const handleArazzo100PetstoreClick = useCallback(async (event) => {
    await loadExampleNestedMenuHandler.current.loadArazzo100LoginAndRetrievePetsFixture(event);
  }, []);
  const handleArazzo100PetCouponsClick = useCallback(async (event) => {
    await loadExampleNestedMenuHandler.current.loadArazzo100PetCouponsFixture(event);
  }, []);
  const handleArazzo100OAuthClick = useCallback(async (event) => {
    await loadExampleNestedMenuHandler.current.loadArazzo100OAuthFixture(event);
  }, []);
  const handleArazzo100BNPLClick = useCallback(async (event) => {
    await loadExampleNestedMenuHandler.current.loadArazzo100BNPLFixture(event);
  }, []);
  const handleArazzo100FAPIPARClick = useCallback(async (event) => {
    await loadExampleNestedMenuHandler.current.loadArazzo100FAPIPARFixture(event);
  }, []);
  const handleArazzo110AsyncAPIClick = useCallback(async (event) => {
    await loadExampleNestedMenuHandler.current.loadArazzo110AsyncAPIFixture(event);
  }, []);

  return (
    <>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <LoadExampleNestedMenuHandler {...props} ref={loadExampleNestedMenuHandler} />
      <DropDownMenuNested label="Load Example">
        <OpenAPI32PetstoreMenuItem onClick={handleOpenAPI32PetstoreClick} />
        <OpenAPI31PetstoreMenuItem onClick={handleOpenAPI31PetstoreClick} />
        <OpenAPI30PetstoreMenuItem onClick={handleOpenAPI30PetstoreClick} />
        <OpenAPI20PetstoreMenuItem onClick={handleOpenAPI20PetstoreClick} />
        <DropdownMenuItemDivider />
        <AsyncAPI30PetstoreMenuItem onClick={handleAsyncAPI30PetstoreClick} />
        <AsyncAPI26PetstoreMenuItem onClick={handleAsyncAPI26PetstoreClick} />
        <AsyncAPI30StreetlightsMenuItem onClick={handleAsyncAPI30StreetlightsClick} />
        <AsyncAPI26StreetlightsMenuItem onClick={handleAsyncAPI26StreetlightsClick} />
        <DropdownMenuItemDivider />
        <JSONSchema202012MenuItem onClick={handleJSONSchema202012Click} />
        <DropdownMenuItemDivider />
        <APIDesignSystemsMenuItem onClick={handleAPIDesignSystemsClick} />
        <DropdownMenuItemDivider />
        <Arazzo100PetstoreMenuItem onClick={handleArazzo100PetstoreClick} />
        <Arazzo100PetCouponsMenuItem onClick={handleArazzo100PetCouponsClick} />
        <Arazzo100OAuthMenuItem onClick={handleArazzo100OAuthClick} />
        <Arazzo100BNPLMenuItem onClick={handleArazzo100BNPLClick} />
        <Arazzo100FAPIPARMenuItem onClick={handleArazzo100FAPIPARClick} />
        <Arazzo110AsyncAPIMenuItem onClick={handleArazzo110AsyncAPIClick} />
      </DropDownMenuNested>
    </>
  );
};

LoadExampleNestedMenu.propTypes = {
  getComponent: PropTypes.func.isRequired,
};

export default LoadExampleNestedMenu;
