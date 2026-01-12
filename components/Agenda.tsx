import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, X, Check } from 'lucide-react';
import { getAgendaEvents, saveAgendaEvent, deleteAgendaEvent } from '../services/storageService';
import { AgendaEvent } from '../types';

const Agenda: React.FC = () => {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<AgendaEvent['type']>('Work');

  useEffect(() => {
    setEvents(getAgendaEvents());
  }, []);

  const handleAddEvent = () => {
      if (!title || !time) return;
      
      const newEvent: AgendaEvent = {
          id: Date.now().toString(),
          title,
          time,
          type,
          date: Date.now()
      };

      saveAgendaEvent(newEvent);
      setEvents(getAgendaEvents());
      setShowAdd(false);
      setTitle('');
      setTime('');
  };

  const handleDelete = (id: string) => {
      deleteAgendaEvent(id);
      setEvents(getAgendaEvents());
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
       <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3"><CalendarIcon className="text-indigo-400"/> Mon Agenda</h2>
            <p className="text-slate-400">Planifiez vos journées.</p>
          </div>
          <button 
            onClick={() => setShowAdd(!showAdd)} 
            className={`p-3 rounded-full text-white transition-all ${showAdd ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-500'}`}
          >
              {showAdd ? <X size={24}/> : <Plus size={24}/>}
          </button>
       </div>

       {showAdd && (
           <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl mb-8 animate-in slide-in-from-top-4">
               <h3 className="text-lg font-bold text-white mb-4">Nouvel Événement</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                   <input 
                    type="text" 
                    placeholder="Titre de l'événement" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                   />
                   <input 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                   />
                   <select 
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                   >
                       <option value="Work">Travail</option>
                       <option value="Finance">Finance</option>
                       <option value="Personal">Personnel</option>
                       <option value="Health">Santé</option>
                   </select>
               </div>
               <button 
                onClick={handleAddEvent}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
               >
                   <Check size={18} /> Ajouter
               </button>
           </div>
       )}

       <div className="space-y-4">
           {events.length === 0 ? (
               <div className="text-center py-10 text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
                   <Clock size={48} className="mx-auto mb-3 opacity-20"/>
                   <p>Aucun événement prévu.</p>
               </div>
           ) : events.map(ev => (
               <div key={ev.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4 group hover:border-indigo-500/30 transition-colors">
                   <div className={`p-3 rounded-lg text-white ${
                       ev.type === 'Work' ? 'bg-blue-600' : 
                       ev.type === 'Finance' ? 'bg-emerald-600' :
                       ev.type === 'Health' ? 'bg-red-500' : 'bg-purple-600'
                   }`}>
                       <Clock size={20}/>
                   </div>
                   <div className="flex-1">
                       <h4 className="font-bold text-white">{ev.title}</h4>
                       <p className="text-sm text-slate-500">{ev.time}</p>
                   </div>
                   <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-950 rounded-full text-xs text-slate-400 border border-slate-800">{ev.type}</span>
                        <button 
                            onClick={() => handleDelete(ev.id)}
                            className="p-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={18} />
                        </button>
                   </div>
               </div>
           ))}
       </div>
    </div>
  );
};

export default Agenda;