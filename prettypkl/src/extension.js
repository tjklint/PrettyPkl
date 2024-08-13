const vscode = require('vscode');

function activate(context) {
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider('pkl', {
            provideDocumentFormattingEdits(document) {
                const edits = [];

                for (let i = 0; i < document.lineCount; i++) {
                    const line = document.lineAt(i);
                    const text = line.text;

                    // Enforce line width: wrap lines that exceed 100 characters
                    if (text.length > 100) {
                        const parts = text.match(/.{1,100}/g) || [];
                        edits.push(vscode.TextEdit.replace(line.range, parts.join('\n')));
                    }

                    // Apply indentation rules
                    const formattedText = applyIndentationRules(text);
                    if (formattedText !== text) {
                        edits.push(vscode.TextEdit.replace(line.range, formattedText));
                    }
                }

                return edits;
            }
        })
    );
}

function applyIndentationRules(text) {
    // Replace tabs with two spaces and trim the text
    text = text.replace(/\t/g, '  ').trim();

    // Handle assignment operator indentation
    const assignmentMatch = text.match(/^(\w+)\s*=\s*(.*)$/);
    if (assignmentMatch) {
        const left = assignmentMatch[1];
        const right = assignmentMatch[2].trim();
        if (right.startsWith('{') || right.includes('\n')) {
            return `${left} =\n  ${right}`;
        } else {
            return `${left} = ${right}`;
        }
    }

    // Handle if-else and let expressions with correct indentation
    if (text.startsWith('if') || text.startsWith('else') || text.startsWith('let')) {
        return text.replace(/(\w+)\s*{/, '$1 {\n  ').replace(/}\s*(\w*)/, '\n} $1');
    }

    // Handle multiline binary operators
    const operatorMatch = text.match(/^(\w+)\s*=\s*(.*)$/);
    if (operatorMatch) {
        const variable = operatorMatch[1];
        const expression = operatorMatch[2];
        if (expression.includes('+') || expression.includes('|>')) {
            const parts = expression.split(/\s*\+\s*|\s*\|\>\s*/);
            return `${variable} =\n  ${parts.join('\n  + ')}`;
        }
    }

    // Handle object bodies: ensure proper indentation without extra lines
    if (text.includes('{') && !text.includes('}')) {
        return text.replace(/\s*\{\s*/, ' {\n  ').replace(/;\s*/g, ';\n  ').replace(/\s*}\s*/g, '\n}');
    }

    // Ensure consistent spacing around operators and braces
    text = text.replace(/\s*=\s*/g, ' = ').replace(/\s*{\s*/g, ' { ').replace(/\s*}\s*/g, ' } ').trim();

    return text;
}



function deactivate() {}

module.exports = {
    activate,
    deactivate
};
