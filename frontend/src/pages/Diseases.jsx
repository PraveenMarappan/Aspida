import React, { useState, useEffect } from 'react';
import { BookOpen, Search } from 'lucide-react';
import DiseaseCard from '../components/DiseaseCard';
import { getDiseases } from '../services/api';

export default function DiseasesPage() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    getDiseases()
      .then(data => setDiseases(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', 'Fungal Infection', 'Oomycete / Water Mold', 'Normal Leaf'];

  const filteredDiseases = diseases.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || d.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-emerald-400" />
            <span>Bitter Gourd Disease Library</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Comprehensive reference guide for crop pathology symptoms, causes, and active management
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search diseases..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              categoryFilter === cat
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>


      {/* Disease Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 text-xs">
          Loading disease library...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDiseases.map((d) => (
            <DiseaseCard key={d.id} disease={d} />
          ))}
        </div>
      )}

    </div>
  );
}
