
import MonacoEditor from '@monaco-editor/react';

function CodeEditor({ code, onChange }) {
    return (
        <div className="monaco-editor">
            <MonacoEditor
                height="90vh"
                language="javascript"  // You can switch languages here
                value={code}
                theme="vs-dark"  // Optional: Set the editor theme
                onChange={(newValue) => onChange(newValue)}
                options={{
                    selectOnLineNumbers: true,
                    automaticLayout: true,
                }}
            />
        </div>
    );
}

export default CodeEditor;
