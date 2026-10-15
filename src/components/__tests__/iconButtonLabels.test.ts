/** @jest-environment node */
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

/**
 * An icon-only <IconButton> has no text, so screen readers announce it as just "button".
 * Every IconButton needs an `aria-label` / `aria-labelledby`, or must be the direct child of a
 * MUI Tooltip with a plain string `title`, which MUI applies as `aria-label`.
 *
 * DarkTooltip does not count: it wraps `title` in a <Box> before handing it to MUI, and MUI only
 * sets `aria-label` when `title` is a string, so the wrapped button stays unnamed.
 */

// Shared swap inputs are tracked separately in https://github.com/aave/interface/issues/3100.
// Exact `file:line` set: remove an entry when that button gets labelled. A new unlabelled
// button anywhere (including these files) fails the test; so does moving one of these, in
// which case update its line here.
const KNOWN_UNLABELLED = [
  'src/components/transactions/Swap/inputs/LimitOrderInputs.tsx:145',
  'src/components/transactions/Swap/inputs/LimitOrderInputs.tsx:184',
  'src/components/transactions/Swap/inputs/MarketOrderInputs.tsx:113',
  'src/components/transactions/Swap/inputs/MarketOrderInputs.tsx:145',
  'src/components/transactions/Swap/inputs/primitives/SwapAssetInput.tsx:360',
];

const ROOT = path.resolve(__dirname, '../../..');

const listTsx = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : listTsx(full);
    return entry.name.endsWith('.tsx') ? [full] : [];
  });

const hasAttr = (attrs: ts.JsxAttributes, names: string[]) =>
  attrs.properties.some((p) => ts.isJsxAttribute(p) && names.includes(p.name.getText()));

const isNamedByTooltip = (node: ts.JsxOpeningLikeElement) => {
  const element = ts.isJsxOpeningElement(node) ? node.parent : node;
  const parent = element.parent;
  if (!ts.isJsxElement(parent)) return false;
  const opening = parent.openingElement;
  if (opening.tagName.getText() !== 'Tooltip') return false;
  return opening.attributes.properties.some(
    (p) =>
      ts.isJsxAttribute(p) &&
      p.name.getText() === 'title' &&
      !!p.initializer &&
      ts.isStringLiteral(p.initializer)
  );
};

const findUnlabelledIconButtons = (file: string) => {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const found: string[] = [];
  const visit = (node: ts.Node) => {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      node.tagName.getText() === 'IconButton' &&
      !hasAttr(node.attributes, ['aria-label', 'aria-labelledby']) &&
      !isNamedByTooltip(node)
    ) {
      const { line } = source.getLineAndCharacterOfPosition(node.getStart());
      found.push(`${path.relative(ROOT, file)}:${line + 1}`);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
};

describe('IconButton accessible names', () => {
  it('labels every icon-only button', () => {
    const unlabelled = [
      ...listTsx(path.join(ROOT, 'src')),
      ...listTsx(path.join(ROOT, 'pages')),
    ].flatMap(findUnlabelledIconButtons);

    expect(unlabelled.sort()).toEqual([...KNOWN_UNLABELLED].sort());
  });
});
