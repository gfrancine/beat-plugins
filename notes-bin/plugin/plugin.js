/*

Plugin name: Notes Bin
Description: Tidies up all (CONT'D)'s in a screenplay.

Version: 0.1.0
Copyright: 2025 gfrancine

*/

const html = Beat.assetAsString("index.html");

const window = Beat.htmlWindow(html, 300, 400, () => {
  Beat.end();
});

Beat.openConsole();

window.runJS("console.log('This is logged in the window')");
