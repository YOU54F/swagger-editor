/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import LoadExampleNestedMenu from '../components/FileMenu/items/LoadExampleNestedMenu/LoadExampleNestedMenu.jsx';
import Arazzo100PetstoreMenuItem from '../components/FileMenu/items/LoadExampleNestedMenu/items/Arazzo100PetstoreMenuItem.jsx';
import Arazzo100PetCouponsMenuItem from '../components/FileMenu/items/LoadExampleNestedMenu/items/Arazzo100PetCouponsMenuItem.jsx';
import Arazzo100OAuthMenuItem from '../components/FileMenu/items/LoadExampleNestedMenu/items/Arazzo100OAuthMenuItem.jsx';
import Arazzo100BNPLMenuItem from '../components/FileMenu/items/LoadExampleNestedMenu/items/Arazzo100BNPLMenuItem.jsx';
import Arazzo100FAPIPARMenuItem from '../components/FileMenu/items/LoadExampleNestedMenu/items/Arazzo100FAPIPARMenuItem.jsx';
import Arazzo110AsyncAPIMenuItem from '../components/FileMenu/items/LoadExampleNestedMenu/items/Arazzo110AsyncAPIMenuItem.jsx';
import EditorContentFixturesPlugin from '../../editor-content-fixtures/index.js';

const components = {
  TopBarFileMenuLoadExampleNestedMenu: LoadExampleNestedMenu,
  TopBarFileMenuLoadExampleNestedMenuArazzo100PetstoreMenuItem: Arazzo100PetstoreMenuItem,
  TopBarFileMenuLoadExampleNestedMenuArazzo100PetCouponsMenuItem: Arazzo100PetCouponsMenuItem,
  TopBarFileMenuLoadExampleNestedMenuArazzo100OAuthMenuItem: Arazzo100OAuthMenuItem,
  TopBarFileMenuLoadExampleNestedMenuArazzo100BNPLMenuItem: Arazzo100BNPLMenuItem,
  TopBarFileMenuLoadExampleNestedMenuArazzo100FAPIPARMenuItem: Arazzo100FAPIPARMenuItem,
  TopBarFileMenuLoadExampleNestedMenuArazzo110AsyncAPIMenuItem: Arazzo110AsyncAPIMenuItem,
};
const fixtures = EditorContentFixturesPlugin().statePlugins.editorContentFixtures.selectors;

const DropdownMenuNested = ({ children }) => <div role="menu">{children}</div>;
const DropdownMenuItem = ({ children, onClick }) => (
  <button type="button" role="menuitem" onClick={onClick}>
    {children}
  </button>
);
const DropdownMenuItemDivider = () => <hr />;

const stubs = { DropdownMenuNested, DropdownMenuItem, DropdownMenuItemDivider };
// non-Arazzo example items are irrelevant here and replaced with generic stubs
const GenericItem = ({ onClick }) => (
  <button type="button" role="menuitem" onClick={onClick}>
    other example
  </button>
);
const getComponent = (name, withSystem = false) => {
  const Component = stubs[name] ?? components[name] ?? GenericItem;
  // mimics swagger-ui's getComponent(name, true), which injects the system into the component
  // eslint-disable-next-line react/jsx-props-no-spreading
  return withSystem ? (props) => <Component {...props} getComponent={getComponent} /> : Component;
};

const ARAZZO_ITEMS = [
  ['Arazzo100PetstoreMenuItem', 'selectArazzo100LoginAndRetrievePetsYAML'],
  ['Arazzo100PetCouponsMenuItem', 'selectArazzo100PetCouponsYAML'],
  ['Arazzo100OAuthMenuItem', 'selectArazzo100OAuthYAML'],
  ['Arazzo100BNPLMenuItem', 'selectArazzo100BNPLYAML'],
  ['Arazzo100FAPIPARMenuItem', 'selectArazzo100FAPIPARYAML'],
  ['Arazzo110AsyncAPIMenuItem', 'selectArazzo110AsyncAPIYAML'],
];

describe('Load Example menu: Arazzo examples', () => {
  const setup = () => {
    const editorActions = { setContent: vi.fn() };
    const editorContentFixturesSelectors = Object.fromEntries(
      Object.entries(fixtures).map(([name, fn]) => [name, vi.fn(fn)])
    );
    const props = {
      getComponent,
      editorActions,
      editorContentFixturesSelectors,
      EditorContentOrigin: { FixtureLoad: 'fixture-load' },
    };
    const LoadExampleNestedMenu = components.TopBarFileMenuLoadExampleNestedMenu;
    render(<LoadExampleNestedMenu {...props} />); // eslint-disable-line react/jsx-props-no-spreading
    return { editorActions, editorContentFixturesSelectors };
  };

  test('should register a menu item component for each Arazzo example', () => {
    ARAZZO_ITEMS.forEach(([item]) => {
      expect(components[`TopBarFileMenuLoadExampleNestedMenu${item}`]).toBeDefined();
    });
  });

  test('should list exactly six Arazzo examples', () => {
    setup();

    expect(
      screen.getAllByRole('menuitem').filter((el) => /Arazzo/.test(el.textContent))
    ).toHaveLength(6);
  });

  test.each(ARAZZO_ITEMS.map(([, selector], i) => [selector, i]))(
    'clicking the example backed by %s loads its fixture',
    (selector) => {
      const { editorActions, editorContentFixturesSelectors } = setup();
      const items = screen.getAllByRole('menuitem').filter((el) => /Arazzo/.test(el.textContent));
      const index = ARAZZO_ITEMS.findIndex(([, s]) => s === selector);

      fireEvent.click(items[index]);

      expect(editorContentFixturesSelectors[selector]).toHaveBeenCalledTimes(1);
      expect(editorActions.setContent).toHaveBeenCalledWith(fixtures[selector](), 'fixture-load');
    }
  );
});
