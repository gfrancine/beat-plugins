# Notes Bin

A Highland 2-like container for storing and organizing your notes in snippets.

![Notes Bin](public/images/Notes%20Bin.png)

<h2>Features</h2>
<ul>
  <li>Drag and drop text from anywhere to create notes or drag notes out of the bin</li>
  <li>Import and export to text (<code>.txt</code>) files</li>
  <li>Text search</li>
  <li>Cut or copy directly from selection</li>
</ul>
<h2>Shortcuts</h2>
<ul>
  <li><code>Cmd + Opt + Z</code> — Toggle window</li>
  <li><code>Cmd + Opt + X</code> — Cut selection to bin</li>
  <li><code>Cmd + Opt + C</code> — Copy selection to bin</li>
</ul>

## Developing

NodeJS and npm are required to install and build the plugin.

```sh
# Install all dependencies
npm i

# Develop the plugin in Beat with live refresh
npm run dev

# Develop just the front-end UI
npm run dev-ui

# Build just the plugin without installing
npm run build

# Build and install the plugin into Beat
npm run install
```
