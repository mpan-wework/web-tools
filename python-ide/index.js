let code = '';

window.onload = () => {
  const codeMirrorEl = document.getElementById('code-mirror');
  const ide = window.CodeMirror.fromTextArea(codeMirrorEl, {
    mode: 'python',
    theme: 'the-matrix',
    smartIndent: true,
    lineWrapping: true,
    lineNumbers: true,
    autofocus: true,

    showInvisibles: true,
  });


  ide.on('change', (ins) => {
    code = ins.getValue();
  });

  const outputEl = document.getElementById('result');
  const printResult = (text, success = true) => {
    const newEl = document.createElement('div');
    newEl.innerHTML = `${text}<br />${new Date().toISOString()}`;
    if (success) {
      newEl.classList.add('success');
    } else {
      newEl.classList.add('failure');
    }
    outputEl.insertBefore(newEl, outputEl.firstChild);
    outputEl.scrollTo({
      top: 0,
    });
  }

  Sk.configure({
    output: (text) => {
      if (text && text !== '\n') {
        printResult(text);
      }
    },
    read: (x) => Sk.builtinFiles["files"][x],
    __future__: Sk.python3,
  });

  outputEl.onclick = () => {
    try {
      Sk.importMainWithBody("<stdin>", false, code);
    } catch (error) {
      printResult(error.toString(), false);
    }
  };
};
