import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, Save, Trash2, Printer, 
  Bold, Italic, Underline, 
  AlignLeft, AlignCenter, AlignRight, 
  List, ListOrdered, 
  Type, Palette, Heading,
  Undo, Redo,
  CheckCircle2
} from 'lucide-react';
import { getSavedDocument, saveDocumentContent } from '../services/storageService';

const DocumentEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [foreColor, setForeColor] = useState('#000000');
  const [lastSaved, setLastSaved] = useState<string>('');

  useEffect(() => {
      // Load saved draft on mount
      if (editorRef.current) {
          editorRef.current.innerHTML = getSavedDocument();
      }
  }, []);

  const handleInput = () => {
      if (editorRef.current) {
          saveDocumentContent(editorRef.current.innerHTML);
          setLastSaved(new Date().toLocaleTimeString());
      }
  };

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput(); // Save after formatting
  };

  const handleClear = () => {
      if (editorRef.current) {
          if(window.confirm("Tout effacer ?")) {
            editorRef.current.innerHTML = '<p>Commencez à rédiger...</p>';
            handleInput();
          }
      }
  };

  const handleSaveText = () => {
      if (!editorRef.current) return;
      const text = editorRef.current.innerText;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document_${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
  };

  const handlePrintPDF = () => {
      window.print();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 h-full flex flex-col print:p-0 print:max-w-none">
       <div className="flex items-center justify-between mb-6 print:hidden">
          <div>
              <h2 className="text-3xl font-bold text-white">Studio Document</h2>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span>Éditeur intelligent</span>
                  {lastSaved && <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 size={12}/> Sauvegardé à {lastSaved}</span>}
              </div>
          </div>
          <div className="flex gap-2">
               <button onClick={handleClear} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center gap-2 transition-colors"><Trash2 size={18}/> Effacer</button>
               <button onClick={handleSaveText} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center gap-2 transition-colors"><Save size={18}/> Txt</button>
               <button onClick={handlePrintPDF} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-2 transition-colors"><Printer size={18}/> PDF</button>
          </div>
       </div>

       <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row overflow-hidden print:border-none print:bg-white print:text-black">
           {/* Toolbar */}
           <div className="w-full md:w-20 bg-slate-950 border-b md:border-b-0 md:border-r border-slate-800 flex flex-row md:flex-col items-center py-4 px-2 gap-3 print:hidden overflow-x-auto md:overflow-y-auto no-scrollbar">
                
                {/* Text Style */}
                <div className="flex md:flex-col gap-2 p-1 bg-slate-900/50 rounded-lg">
                    <button onClick={() => handleFormat('bold')} className="p-2 hover:bg-indigo-600 text-slate-300 rounded transition-colors" title="Gras"><Bold size={18}/></button>
                    <button onClick={() => handleFormat('italic')} className="p-2 hover:bg-indigo-600 text-slate-300 rounded transition-colors" title="Italique"><Italic size={18}/></button>
                    <button onClick={() => handleFormat('underline')} className="p-2 hover:bg-indigo-600 text-slate-300 rounded transition-colors" title="Souligné"><Underline size={18}/></button>
                </div>

                <div className="w-px h-6 md:w-8 md:h-px bg-slate-800 my-1"></div>

                {/* Alignment */}
                <div className="flex md:flex-col gap-2 p-1 bg-slate-900/50 rounded-lg">
                    <button onClick={() => handleFormat('justifyLeft')} className="p-2 hover:bg-indigo-600 text-slate-300 rounded transition-colors" title="Gauche"><AlignLeft size={18}/></button>
                    <button onClick={() => handleFormat('justifyCenter')} className="p-2 hover:bg-indigo-600 text-slate-300 rounded transition-colors" title="Centre"><AlignCenter size={18}/></button>
                    <button onClick={() => handleFormat('justifyRight')} className="p-2 hover:bg-indigo-600 text-slate-300 rounded transition-colors" title="Droite"><AlignRight size={18}/></button>
                </div>

                <div className="w-px h-6 md:w-8 md:h-px bg-slate-800 my-1"></div>

                {/* Lists */}
                <div className="flex md:flex-col gap-2 p-1 bg-slate-900/50 rounded-lg">
                    <button onClick={() => handleFormat('insertUnorderedList')} className="p-2 hover:bg-indigo-600 text-slate-300 rounded transition-colors" title="Puces"><List size={18}/></button>
                    <button onClick={() => handleFormat('insertOrderedList')} className="p-2 hover:bg-indigo-600 text-slate-300 rounded transition-colors" title="Numérotation"><ListOrdered size={18}/></button>
                </div>

                <div className="w-px h-6 md:w-8 md:h-px bg-slate-800 my-1"></div>

                {/* Fonts & Colors */}
                <div className="flex md:flex-col gap-3 items-center p-1 bg-slate-900/50 rounded-lg">
                    <div className="relative group">
                         <Type size={18} className="text-slate-300 mx-auto" />
                         <select 
                            onChange={(e) => handleFormat('fontName', e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            title="Police"
                         >
                             <option value="Arial">Arial</option>
                             <option value="Times New Roman">Times New Roman</option>
                             <option value="Courier New">Courier New</option>
                             <option value="Georgia">Georgia</option>
                             <option value="Verdana">Verdana</option>
                         </select>
                    </div>

                    <div className="relative group">
                         <Heading size={18} className="text-slate-300 mx-auto" />
                         <select 
                            onChange={(e) => handleFormat('fontSize', e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            title="Taille"
                         >
                             <option value="3">Normal</option>
                             <option value="1">Petit</option>
                             <option value="4">Grand</option>
                             <option value="5">Très Grand</option>
                             <option value="7">Géant</option>
                         </select>
                    </div>

                    <div className="relative flex items-center justify-center w-8 h-8 rounded hover:bg-slate-800 transition-colors cursor-pointer overflow-hidden">
                        <input 
                            type="color" 
                            value={foreColor}
                            onChange={(e) => {
                                setForeColor(e.target.value);
                                handleFormat('foreColor', e.target.value);
                            }}
                            className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] p-0 border-0 cursor-pointer"
                            title="Couleur du texte"
                        />
                        <Palette size={18} className="text-slate-300 pointer-events-none z-10" />
                        <div className="absolute bottom-1 w-4 h-1 rounded-full z-10" style={{ backgroundColor: foreColor }}></div>
                    </div>
                </div>

                <div className="w-px h-6 md:w-8 md:h-px bg-slate-800 my-1"></div>

                {/* History */}
                <div className="flex md:flex-col gap-2 p-1 bg-slate-900/50 rounded-lg">
                     <button onClick={() => handleFormat('undo')} className="p-2 hover:bg-slate-700 text-slate-400 rounded transition-colors" title="Annuler"><Undo size={16}/></button>
                     <button onClick={() => handleFormat('redo')} className="p-2 hover:bg-slate-700 text-slate-400 rounded transition-colors" title="Rétablir"><Redo size={16}/></button>
                </div>
           </div>
           
           {/* Editor Area */}
           <div className="flex-1 p-4 md:p-8 overflow-y-auto print:p-0 print:overflow-visible bg-slate-800/50">
               <div 
                    ref={editorRef}
                    onInput={handleInput}
                    className="bg-white text-slate-900 min-h-[800px] shadow-2xl mx-auto max-w-3xl p-12 rounded-sm outline-none print:shadow-none print:w-full print:max-w-none prose prose-lg" 
                    contentEditable
                    suppressContentEditableWarning
                    style={{ fontFamily: 'Arial, sans-serif' }}
               >
               </div>
           </div>
       </div>
    </div>
  );
};

export default DocumentEditor;