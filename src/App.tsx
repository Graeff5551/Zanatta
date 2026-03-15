import { motion, AnimatePresence } from "motion/react";
import { 
  Clock, 
  MapPin, 
  Instagram, 
  Menu as MenuIcon, 
  X, 
  ArrowRight,
  ArrowLeft,
  Trash2,
  Plus,
  Phone,
  ChevronRight,
  Star,
  Edit2,
  Check,
  Image as ImageIcon,
  Sparkles,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";

const WHATSAPP_LINK = "https://l.instagram.com/?u=https%3A%2F%2Fwa.me%2F5551996036357%3Futm_source%3Dig%26utm_medium%3Dsocial%26utm_content%3Dlink_in_bio%26fbclid%3DPAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnVEudPLt-f6YHp5OpjxWj16dk96c8fO9RA4zTJXMFp_rQiOft6QD0wuaSHzE_aem_rD3Nd6b6qk9YmZpfvjB2Kw&e=AT7HI9u_4aWKh-PUbwNVTyYO-8mfl0EPmfAsVTBg_gUPyLi9NQ1GNTWa5w6vDBb-ccesZemQ4Qa91347VW9e-5IksfkY3eh1awou2XSONHbz96X_mcPo1Tl3Hw";
const INSTAGRAM_LINK = "https://www.instagram.com/restaurantefamiliazanatta";
const MAPS_LINK = "https://maps.app.goo.gl/jp4v56zLWpgvk6CU9";

const INITIAL_IMAGES = {
  hero: "https://drive.google.com/thumbnail?id=10__2JRCRJyG2OX9oaQkNCgtRQK-Eu8tF&sz=w1600",
  about1: "https://drive.google.com/thumbnail?id=1sCawj7dteafr8kDJ0EpXtJBHtd1WaFab&sz=w1600",
  about2: "https://drive.google.com/thumbnail?id=1XA6Lo-rZLG6TfQqE4ki7ytGc8KEVxY5i&sz=w1600",
  buffet1: "https://drive.google.com/thumbnail?id=1cewxEmitlBU6PHByMPXPcL6FlzUJCAog&sz=w1600",
  buffet2: "https://drive.google.com/thumbnail?id=1N-ED25XOdIj2M80KZQ90h8mUkaWq47AK&sz=w1600",
  buffet3: "https://drive.google.com/thumbnail?id=15x7f69qAlwVSmdorlxU1yzmcRIG2wnlI&sz=w1600",
  buffet4: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=1600",
  gallery: [
    "https://drive.google.com/thumbnail?id=1BjTHwQqQ4gZUfs_WqIbtkM8hCUoeqS0z&sz=w1600",
    "https://drive.google.com/thumbnail?id=1a6l4vfJH4JFlfVkKwkeuB6iS2IvWDfko&sz=w1600",
    "https://drive.google.com/thumbnail?id=16H_rckDBlKP7vdiF2vbizCcyvvkE1Btl&sz=w1600",
    "https://drive.google.com/thumbnail?id=1sJgn6qVUXytPEwtbZK0qXJ-9yn2jGUKt&sz=w1600",
  ]
};

export default function App() {
  // Load images from localStorage if they exist, otherwise use INITIAL_IMAGES
  const [images, setImages] = useState(() => {
    const saved = localStorage.getItem('zanatta_images_v3');
    return saved ? JSON.parse(saved) : INITIAL_IMAGES;
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | { type: 'gallery', index: number } | null>(null);
  const [tempUrl, setTempUrl] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);

  // Save to localStorage whenever images change
  useEffect(() => {
    localStorage.setItem('zanatta_images_v3', JSON.stringify(images));
  }, [images]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleEnhanceWithAI = async () => {
    // Check for API key first
    const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
    if (!hasKey) {
      setShowKeyPrompt(true);
      return;
    }

    try {
      setIsEnhancing(true);
      
      // 1. Fetch the image and convert to base64
      const response = await fetch(tempUrl);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(blob);
      });

      // 2. Call Gemini to enhance
      const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
      const model = "gemini-3.1-flash-image-preview";
      
      const result = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              inlineData: {
                data: base64,
                mimeType: blob.type
              }
            },
            {
              text: "Enhance this image to high resolution (4K quality). Make it extremely sharp, detailed, and vibrant. Keep the composition, subjects, and colors exactly the same, but improve the clarity and resolution significantly. Do not add new elements."
            }
          ]
        },
        config: {
          imageConfig: {
            imageSize: "4K",
            aspectRatio: "1:1" // We'll try to match the original aspect ratio if possible, but 1:1 is safe for many UI elements
          }
        }
      });

      // 3. Find the image part in response
      for (const part of result.candidates[0].content.parts) {
        if (part.inlineData) {
          setTempUrl(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error) {
      console.error("Error enhancing image:", error);
      alert("Erro ao melhorar imagem com IA. Verifique se o link da imagem permite acesso (CORS) ou tente outra imagem.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSelectKey = async () => {
    await (window as any).aistudio?.openSelectKey();
    setShowKeyPrompt(false);
    handleEnhanceWithAI();
  };

  const formatImageUrl = (url: string) => {
    if (!url) return url;
    
    // Extract ID using a more aggressive regex (Drive IDs are typically 33+ chars)
    const driveIdMatch = url.match(/[-\w]{25,}/);
    
    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
      if (driveIdMatch && driveIdMatch[0]) {
        // The thumbnail endpoint is often more resilient for embedding
        return `https://drive.google.com/thumbnail?id=${driveIdMatch[0]}&sz=w1600`;
      }
    }
    
    return url;
  };

  const handleImageUpdate = () => {
    if (!editingKey) return;

    const finalUrl = formatImageUrl(tempUrl);

    if (typeof editingKey === 'string') {
      setImages(prev => ({ ...prev, [editingKey]: finalUrl }));
    } else {
      const newGallery = [...images.gallery];
      newGallery[editingKey.index] = finalUrl;
      setImages(prev => ({ ...prev, gallery: newGallery }));
    }
    setEditingKey(null);
    setTempUrl("");
  };

  const moveGalleryImage = (index: number, direction: 'left' | 'right') => {
    const newGallery = [...images.gallery];
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newGallery.length) return;
    
    const temp = newGallery[index];
    newGallery[index] = newGallery[newIndex];
    newGallery[newIndex] = temp;
    setImages(prev => ({ ...prev, gallery: newGallery }));
  };

  const deleteGalleryImage = (index: number) => {
    if (images.gallery.length <= 1) {
      alert("A galeria deve ter pelo menos uma imagem.");
      return;
    }
    const newGallery = images.gallery.filter((_, i) => i !== index);
    setImages(prev => ({ ...prev, gallery: newGallery }));
  };

  const addGalleryImage = () => {
    const newGallery = [...images.gallery, "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80"];
    setImages(prev => ({ ...prev, gallery: newGallery }));
  };

  const EditButton = ({ id, galleryIndex }: { id: string, galleryIndex?: number }) => {
    if (!isEditing) return null;
    return (
      <div className="absolute top-4 right-4 z-40 flex flex-wrap gap-2 justify-end max-w-[200px]">
        {galleryIndex !== undefined && (
          <>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                moveGalleryImage(galleryIndex, 'left');
              }}
              disabled={galleryIndex === 0}
              className="bg-brand-paper/90 backdrop-blur p-2 rounded-full shadow-lg hover:bg-brand-clay hover:text-brand-paper transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="Mover para esquerda"
            >
              <ArrowLeft size={16} />
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                moveGalleryImage(galleryIndex, 'right');
              }}
              disabled={galleryIndex === images.gallery.length - 1}
              className="bg-brand-paper/90 backdrop-blur p-2 rounded-full shadow-lg hover:bg-brand-clay hover:text-brand-paper transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="Mover para direita"
            >
              <ArrowRight size={16} />
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirm("Tem certeza que deseja excluir esta imagem da galeria?")) {
                  deleteGalleryImage(galleryIndex);
                }
              }}
              className="bg-red-500/90 backdrop-blur p-2 rounded-full shadow-lg text-white hover:bg-red-600 transition-all"
              title="Excluir imagem"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setEditingKey(galleryIndex !== undefined ? { type: 'gallery', index: galleryIndex } : id);
            setTempUrl(galleryIndex !== undefined ? images.gallery[galleryIndex] : (images as any)[id]);
          }}
          className="bg-brand-paper/90 backdrop-blur p-2 rounded-full shadow-lg hover:bg-brand-clay hover:text-brand-paper transition-all group"
          title="Editar link"
        >
          <Edit2 size={16} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-brand-paper selection:bg-brand-olive selection:text-brand-paper">
      {/* Admin Toggle removed as per user request */}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingKey && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-brand-ink/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-brand-paper w-full max-w-lg rounded-[2rem] p-10 shadow-2xl"
            >
              <h3 className="text-2xl font-serif mb-6">Alterar Link da Imagem</h3>
              <p className="text-sm text-brand-ink/60 mb-6">
                Cole o link da imagem abaixo. 
                <span className="block mt-1 text-brand-olive font-medium">Links do Google Drive são convertidos automaticamente!</span>
              </p>
              
              <div className="space-y-4 mb-8">
                <input 
                  type="text" 
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="w-full bg-brand-ink/5 border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-olive outline-none"
                />
                
                <button 
                  onClick={handleEnhanceWithAI}
                  disabled={isEnhancing || !tempUrl}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-brand-clay/10 text-brand-clay hover:bg-brand-clay hover:text-brand-paper transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEnhancing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Melhorando com IA...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Aumentar Resolução (IA)
                    </>
                  )}
                </button>
              </div>

              {showKeyPrompt && (
                <div className="mb-6 p-4 bg-brand-clay/5 border border-brand-clay/20 rounded-xl">
                  <p className="text-xs text-brand-clay mb-3">Para usar a IA de alta resolução, você precisa selecionar uma chave de API paga do Google Cloud.</p>
                  <button 
                    onClick={handleSelectKey}
                    className="text-xs font-bold underline hover:text-brand-ink transition-colors"
                  >
                    Selecionar Chave de API
                  </button>
                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="block text-[10px] mt-2 opacity-60">
                    Saiba mais sobre faturamento
                  </a>
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={() => setEditingKey(null)}
                  className="flex-1 py-4 rounded-full font-bold border border-brand-ink/10 hover:bg-brand-ink/5 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleImageUpdate}
                  className="flex-1 py-4 rounded-full font-bold bg-brand-olive text-brand-paper hover:bg-brand-ink transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-brand-paper/80 backdrop-blur-md py-4 shadow-sm" : "py-8"}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-12">
            <a href="#home" className="text-2xl font-serif font-bold tracking-tight">
              ZANATTA<span className="text-brand-clay">.</span>
            </a>
            <div className="hidden md:flex gap-8 text-xs uppercase tracking-widest font-medium opacity-60">
              <a href="#sobre" className="hover:opacity-100 transition-opacity">Sobre</a>
              <a href="#buffet" className="hover:opacity-100 transition-opacity">Buffet</a>
              <a href="#galeria" className="hover:opacity-100 transition-opacity">Galeria</a>
              <a href="#contato" className="hover:opacity-100 transition-opacity">Contato</a>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <a 
              href={WHATSAPP_LINK} 
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-brand-olive hover:text-brand-clay transition-colors"
            >
              Reservar <ArrowRight size={14} />
            </a>
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 hover:bg-brand-ink/5 rounded-full transition-colors md:hidden"
            >
              <MenuIcon size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-0 z-[60] bg-brand-paper flex flex-col p-10"
          >
            <div className="flex justify-end">
              <button onClick={() => setIsMenuOpen(false)} className="p-2">
                <X size={32} />
              </button>
            </div>
            <div className="flex flex-col gap-8 mt-20">
              {["Sobre", "Buffet", "Galeria", "Contato"].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-5xl font-serif hover:text-brand-clay transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-40 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs uppercase tracking-[0.5em] font-bold text-brand-clay mb-6"
            >
              Tramandaí • Rio Grande do Sul
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-display font-serif mb-12"
            >
              Sabor que <br /> <span className="italic font-light">abraça</span> a alma.
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="relative w-full max-w-4xl aspect-[16/9] mb-12"
            >
              <div className="absolute inset-0 bg-brand-olive/10 rounded-[4rem] md:rounded-[10rem] rotate-2"></div>
              <EditButton id="hero" />
              <img 
                src={images.hero} 
                alt="Buffet Zanatta"
                className="relative w-full h-full object-cover rounded-[4rem] md:rounded-[10rem] shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-10 -right-10 hidden lg:block">
                <div className="bg-brand-paper p-8 rounded-full shadow-xl border border-brand-ink/5 flex flex-col items-center justify-center w-40 h-40">
                  <span className="text-3xl font-serif font-bold">100%</span>
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Caseiro</span>
                </div>
              </div>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg md:text-xl text-brand-ink/60 max-w-xl leading-relaxed mb-12"
            >
              No Restaurante Família Zanatta, cada prato é preparado com ingredientes frescos e o carinho de quem cozinha para a própria família.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <a href="#buffet" className="bg-brand-olive text-brand-paper px-10 py-5 rounded-full font-bold hover:bg-brand-ink transition-colors">
                Conheça o Buffet
              </a>
              <a 
                href={WHATSAPP_LINK} 
                target="_blank"
                rel="noopener noreferrer"
                className="border border-brand-ink/20 px-10 py-5 rounded-full font-bold hover:bg-brand-ink hover:text-brand-paper transition-all"
              >
                Fale Conosco
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-20 md:py-40 bg-brand-ink text-brand-paper">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <EditButton id="about1" />
                <img 
                  src={images.about1} 
                  alt="Ambiente" 
                  className="w-full aspect-[3/4] object-cover rounded-3xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="pt-12 relative">
                <EditButton id="about2" />
                <img 
                  src={images.about2} 
                  alt="Comida" 
                  className="w-full aspect-[3/4] object-cover rounded-3xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-paper text-brand-ink p-6 rounded-2xl shadow-2xl hidden md:block">
              <div className="flex items-center gap-4 mb-2">
                <div className="flex text-brand-gold">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <span className="text-xs font-bold">4.8 no Google</span>
              </div>
              <p className="text-sm italic">"Melhor buffet de Tramandaí!"</p>
            </div>
          </div>
          <div>
            <span className="text-xs uppercase tracking-[0.5em] font-bold text-brand-gold mb-6 block">Nossa Essência</span>
            <h2 className="text-5xl md:text-6xl font-serif mb-10 leading-tight">Tradição que passa de geração em geração.</h2>
            <p className="text-brand-paper/70 text-lg mb-12 leading-relaxed">
              O Restaurante Família Zanatta nasceu do desejo de oferecer uma experiência gastronômica autêntica. Localizado no coração de Tramandaí, somos referência em buffet de comida caseira, onde a qualidade dos ingredientes e o tempero artesanal são nossas prioridades.
            </p>
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="border-l border-brand-gold/30 pl-6">
                <h4 className="font-serif text-2xl mb-2">Ambiente</h4>
                <p className="text-sm text-brand-paper/50">Acolhedor e familiar, ideal para almoços tranquilos e reuniões de amigos.</p>
              </div>
              <div className="border-l border-brand-gold/30 pl-6">
                <h4 className="font-serif text-2xl mb-2">Variedade</h4>
                <p className="text-sm text-brand-paper/50">Desde saladas frescas até frutos do mar, um buffet completo todos os dias.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Buffet Showcase */}
      <section id="buffet" className="py-20 md:py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
            <div className="max-w-2xl">
              <span className="text-xs uppercase tracking-[0.5em] font-bold text-brand-clay mb-6 block">O Cardápio</span>
              <h2 className="text-5xl md:text-7xl font-serif">Variedade que encanta o paladar.</h2>
            </div>
            <p className="text-brand-ink/60 max-w-xs mb-2">
              Nosso buffet é renovado diariamente com os melhores produtos da estação.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            <div className="md:col-span-8 group relative overflow-hidden rounded-[3rem]">
              <EditButton id="buffet1" />
              <img 
                src={images.buffet1} 
                alt="Carnes" 
                className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/80 to-transparent flex flex-col justify-end p-10">
                <h4 className="text-brand-paper text-4xl font-serif mb-2">Carnes & Grelhados</h4>
                <p className="text-brand-paper/60 text-sm">Cortes selecionados preparados na hora.</p>
              </div>
            </div>
            <div className="md:col-span-4 group relative overflow-hidden rounded-[3rem]">
              <EditButton id="buffet2" />
              <img 
                src={images.buffet2} 
                alt="Saladas" 
                className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/80 to-transparent flex flex-col justify-end p-10">
                <h4 className="text-brand-paper text-4xl font-serif mb-2">Saladas</h4>
                <p className="text-brand-paper/60 text-sm">Frescor direto do produtor.</p>
              </div>
            </div>
            <div className="md:col-span-4 group relative overflow-hidden rounded-[3rem]">
              <EditButton id="buffet3" />
              <img 
                src={images.buffet3} 
                alt="Frutos do Mar" 
                className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/80 to-transparent flex flex-col justify-end p-10">
                <h4 className="text-brand-paper text-4xl font-serif mb-2">Frutos do Mar</h4>
                <p className="text-brand-paper/60 text-sm">O melhor do litoral gaúcho.</p>
              </div>
            </div>
            <div className="md:col-span-8 group relative overflow-hidden rounded-[3rem]">
              <EditButton id="buffet4" />
              <img 
                src={images.buffet4} 
                alt="Massas" 
                className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/80 to-transparent flex flex-col justify-end p-10">
                <h4 className="text-brand-paper text-4xl font-serif mb-2">Massas & Acompanhamentos</h4>
                <p className="text-brand-paper/60 text-sm">Receitas clássicas com toque caseiro.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Marquee */}
      <section id="galeria" className="py-20 bg-brand-paper overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-12 flex justify-between items-end">
          <div>
            <h2 className="text-5xl font-serif mb-4">Nossa Galeria</h2>
            <p className="text-brand-ink/60">Momentos e sabores registrados em nossa casa.</p>
          </div>
          {isEditing && (
            <button 
              onClick={addGalleryImage}
              className="flex items-center gap-2 bg-brand-olive text-brand-paper px-6 py-3 rounded-full font-bold hover:bg-brand-ink transition-all shadow-lg"
            >
              <Plus size={20} /> Adicionar Foto
            </button>
          )}
        </div>
        <div className="flex gap-4 animate-marquee whitespace-nowrap">
          {images.gallery.map((img, i) => (
            <div key={i} className="h-[300px] md:h-[500px] aspect-[4/5] inline-block relative">
              <EditButton id="gallery" galleryIndex={i} />
              <img 
                src={img} 
                alt="Galeria" 
                className="w-full h-full object-cover rounded-[2rem] md:rounded-[4rem]"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {images.gallery.map((img, i) => (
            <div key={`dup-${i}`} className="h-[300px] md:h-[500px] aspect-[4/5] inline-block relative">
              <img 
                src={img} 
                alt="Galeria" 
                className="w-full h-full object-cover rounded-[2rem] md:rounded-[4rem]"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-20 md:py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-brand-olive/5 rounded-[4rem] md:rounded-[10rem] p-10 md:p-24 grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl md:text-7xl font-serif mb-12">Venha nos <br /> <span className="italic">visitar</span>.</h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-brand-olive/10 flex items-center justify-center shrink-0">
                    <MapPin className="text-brand-olive" size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold opacity-40 mb-1">Endereço</p>
                    <p className="text-lg">Av. Fernando Amaral, 695 – Centro, Tramandaí – RS</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-brand-olive/10 flex items-center justify-center shrink-0">
                    <Clock className="text-brand-olive" size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold opacity-40 mb-1">Horário</p>
                    <p className="text-lg">Todos os dias, das 11h às 15h</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-brand-olive/10 flex items-center justify-center shrink-0">
                    <Phone className="text-brand-olive" size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold opacity-40 mb-1">WhatsApp</p>
                    <p className="text-lg">(51) 99603-6357</p>
                  </div>
                </div>
              </div>
              <div className="mt-12 flex flex-wrap gap-4">
                <a 
                  href={MAPS_LINK} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-brand-ink text-brand-paper px-8 py-4 rounded-full font-bold hover:bg-brand-olive transition-colors inline-flex items-center gap-2"
                >
                  Abrir no Maps <ArrowRight size={16} />
                </a>
                <a 
                  href={WHATSAPP_LINK} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-brand-paper border border-brand-ink/10 px-8 py-4 rounded-full font-bold hover:bg-brand-ink hover:text-brand-paper transition-all"
                >
                  Chamar no WhatsApp
                </a>
              </div>
            </div>
            <div className="h-[400px] md:h-[600px] rounded-[3rem] md:rounded-[8rem] overflow-hidden shadow-2xl">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3458.747161803247!2d-50.13626272356614!3d-29.98667522968393!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9519796796666667%3A0x6666666666666666!2sAv.%20Fernando%20Amaral%2C%20695%20-%20Centro%2C%20Tramanda%C3%AD%20-%20RS%2C%2095590-000!5e0!3m2!1spt-BR!2sbr!4v1710430000000!5m2!1spt-BR!2sbr" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-brand-ink/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-20">
            <div>
              <a href="#home" className="text-4xl font-serif font-bold tracking-tight mb-4 block">
                ZANATTA<span className="text-brand-clay">.</span>
              </a>
              <p className="text-brand-ink/40 text-sm max-w-xs">
                O melhor buffet de comida caseira no coração de Tramandaí. Qualidade e tradição em cada refeição.
              </p>
            </div>
            <div className="flex gap-12">
              <div className="flex flex-col gap-4">
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">Social</span>
                <a href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-brand-clay transition-colors">Instagram</a>
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-brand-clay transition-colors">WhatsApp</a>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">Navegação</span>
                <a href="#sobre" className="text-sm hover:text-brand-clay transition-colors">Sobre</a>
                <a href="#buffet" className="text-sm hover:text-brand-clay transition-colors">Buffet</a>
                <a href="#galeria" className="text-sm hover:text-brand-clay transition-colors">Galeria</a>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between pt-10 border-t border-brand-ink/5 text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">
            <p>© {new Date().getFullYear()} Restaurante Família Zanatta</p>
            <p>Desenvolvido com carinho em Tramandaí</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp for Mobile */}
      <a 
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[100] bg-brand-olive text-brand-paper p-4 rounded-full shadow-2xl md:hidden"
      >
        <Phone size={24} />
      </a>

      {/* Custom Styles */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
