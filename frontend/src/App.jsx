import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from './services/api';

function App() {
  const [especies, setEspecies] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [especieSeleccionada, setEspecieSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [especiesData, categoriasData] = await Promise.all([
          api.getEspecies(),
          api.getCategorias()
        ]);
        setEspecies(especiesData);
        setCategorias(categoriasData);
        console.log('✅ Datos cargados:', especiesData.length, 'especies');
      } catch (error) {
        console.error('❌ Error al cargar datos:', error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  // Cargar especies cuando cambia la categoría o búsqueda
  useEffect(() => {
    const cargarEspecies = async () => {
      setCargando(true);
      try {
        let data;
        if (terminoBusqueda) {
          data = await api.buscar(terminoBusqueda);
        } else {
          data = await api.getEspecies(categoriaSeleccionada);
        }
        setEspecies(data);
      } catch (error) {
        console.error('❌ Error al cargar especies:', error);
      } finally {
        setCargando(false);
      }
    };
    cargarEspecies();
  }, [categoriaSeleccionada, terminoBusqueda]);

  const handleCategoriaClick = (categoria) => {
    setCategoriaSeleccionada(categoria === categoriaSeleccionada ? null : categoria);
    setTerminoBusqueda('');
  };

  const handleEspecieClick = (especie) => {
    setEspecieSeleccionada(especie);
  };

  const handleCerrarModal = () => {
    setEspecieSeleccionada(null);
  };

  // Mostrar mensaje de carga
  if (cargando && especies.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-beni-gold border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Cargando especies...</p>
          <p className="text-gray-500 text-sm mt-2">Conectando con el servidor CIBIOMA</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Hero - Pantalla de inicio */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative h-[70vh] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1588392382834-89c3c3d4c9d8?w=1600")'
        }}
      >
        <div className="text-center text-white px-4">
          <motion.h1 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold mb-4"
          >
            CIBIOMA Virtual
          </motion.h1>
          <motion.p 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto"
          >
            Descubre la increíble biodiversidad del Beni
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
          >
            <span className="text-3xl">⬇</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Sección principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          {/* Buscador */}
          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="🔍 Buscar especie..."
              value={terminoBusqueda}
              onChange={(e) => {
                setTerminoBusqueda(e.target.value);
                if (e.target.value === '') setCategoriaSeleccionada(null);
              }}
              className="w-full bg-slate-700 text-white placeholder-gray-400 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-beni-gold"
            />
          </div>

          {/* Filtros de categorías */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoriaSeleccionada(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                categoriaSeleccionada === null
                  ? 'bg-beni-gold text-slate-900'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              Todos
            </button>
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoriaClick(cat.nombre)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                  categoriaSeleccionada === cat.nombre
                    ? 'bg-beni-gold text-slate-900'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                <span>{cat.icono}</span> {cat.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de especies */}
        {cargando ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-beni-gold border-t-transparent"></div>
          </div>
        ) : especies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-xl">No se encontraron especies</p>
            <p className="text-gray-500 mt-2">Intenta con otra búsqueda o filtro</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {especies.map((especie) => (
              <motion.div
                key={especie.id}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                onClick={() => handleEspecieClick(especie)}
                className="bg-slate-800 rounded-xl overflow-hidden shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
              >
                {/* ========================================== */}
                {/* OPCIÓN 1: IMAGEN COMPLETA SIN CORTAR */}
                {/* ========================================== */}
                <div className="h-48 overflow-hidden bg-slate-800 flex items-center justify-center">
                  <img 
                    src={especie.imagen_url || 'https://via.placeholder.com/400x300/1a4d2e/ffffff?text=Sin+Imagen'} 
                    alt={especie.nombre_comun}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300/1a4d2e/ffffff?text=Imagen+no+disponible';
                    }}
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-white">{especie.nombre_comun}</h3>
                    <span className="text-xl">{especie.icono}</span>
                  </div>
                  <p className="text-sm text-gray-400 italic">{especie.nombre_cientifico}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs bg-slate-700 px-2 py-1 rounded-full text-gray-300">
                      {especie.habitat || 'Sin hábitat'}
                    </span>
                    <span className="text-xs bg-slate-700 px-2 py-1 rounded-full text-gray-300">
                      {especie.alimentacion || 'Sin información'}
                    </span>
                  </div>
                  {especie.destacado && (
                    <div className="mt-2">
                      <span className="text-xs bg-beni-gold text-slate-900 px-2 py-1 rounded-full font-semibold">
                        ⭐ Destacado
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* MODAL - IMAGEN COMPLETA SIN CORTAR */}
      {/* ========================================== */}
      <AnimatePresence>
        {especieSeleccionada && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCerrarModal}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="relative">
                <button
                  onClick={handleCerrarModal}
                  className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/30 rounded-full p-2 z-10"
                >
                  ✕
                </button>
                <div className="w-full h-64 bg-slate-800 flex items-center justify-center rounded-t-2xl overflow-hidden">
                  <img 
                    src={especieSeleccionada.imagen_url || 'https://via.placeholder.com/800x400/1a4d2e/ffffff?text=Sin+Imagen'} 
                    alt={especieSeleccionada.nombre_comun}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/800x400/1a4d2e/ffffff?text=Imagen+no+disponible';
                    }}
                  />
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{especieSeleccionada.nombre_comun}</h2>
                    <p className="text-gray-400 italic">{especieSeleccionada.nombre_cientifico}</p>
                  </div>
                  <span className="text-3xl">{especieSeleccionada.icono}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-slate-700 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">Hábitat</p>
                    <p className="text-white font-medium">{especieSeleccionada.habitat || 'No especificado'}</p>
                  </div>
                  <div className="bg-slate-700 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">Alimentación</p>
                    <p className="text-white font-medium">{especieSeleccionada.alimentacion || 'No especificado'}</p>
                  </div>
                </div>

                {especieSeleccionada.dato_curioso && (
                  <div className="mt-4 bg-beni-gold/10 border border-beni-gold/30 rounded-lg p-4">
                    <p className="text-sm text-beni-gold font-semibold">💡 Dato curioso</p>
                    <p className="text-gray-300 mt-1">{especieSeleccionada.dato_curioso}</p>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs bg-slate-700 px-3 py-1 rounded-full text-gray-300">
                    {especieSeleccionada.categoria_nombre || 'Sin categoría'}
                  </span>
                  {especieSeleccionada.destacado && (
                    <span className="text-xs bg-beni-gold text-slate-900 px-3 py-1 rounded-full font-semibold">
                      ⭐ Destacado
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;