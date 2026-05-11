import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Receipt, Activity, Layers, Terminal } from "lucide-react";
import { motion } from "motion/react";
import HealthyChefLogo from "./HealthyChefLogo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-health-bg text-health-ink font-sans selection:bg-health-olive/20 relative overflow-hidden">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-health-cream/80 backdrop-blur-md border-b border-health-muted/10 px-8 py-6 flex justify-between items-center px-12 lg:px-24">
        <HealthyChefLogo size={44} />
        <div className="flex items-center gap-12">
          <Link 
            to="/dashboard" 
            className="btn-health"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-24 px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center mb-24 gap-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl text-center lg:text-left"
            >
              <span className="health-label mb-6 text-health-sage block text-xs font-bold uppercase tracking-widest">// Clinical Nutrition & Human Optimization</span>
              <h1 className="text-7xl md:text-8xl lg:text-[7rem] leading-[1] font-serif font-bold text-health-leaf mb-10">
                Optimal Human <br />
                <span className="italic text-health-sage">Nutrition.</span>
              </h1>
              <p className="text-xl leading-relaxed text-health-muted mb-12 max-w-2xl mx-auto lg:mx-0">
                At HealthyChef, we bridge the gap between clinical nutrition and gourmet culinary arts. Our meals are engineered for peak human performance, using bio-available ingredients curated by lead nutritionists.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <Link to="/dashboard" className="btn-health px-12 py-5 text-lg flex justify-center items-center gap-3">
                  Consult a Nutritionist <ArrowRight size={20} />
                </Link>
                <a href="#story" className="px-12 py-5 rounded-full border border-health-olive text-health-olive font-medium hover:bg-health-olive hover:text-white transition-all duration-300">
                  Our Bio-Strategy
                </a>
              </div>
            </motion.div>
            
            <div className="w-full lg:w-1/2 relative">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="health-card p-4 bg-white/50 backdrop-blur-sm"
              >
                <img 
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1200&h=1200" 
                  alt="Bio-Available Human Nutrition Protocol" 
                  className="w-full h-auto rounded-[20px] aspect-square object-cover shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-10 -left-10 health-card p-8 w-72 bg-health-cream shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-3 h-3 rounded-full bg-health-sage" />
                   <span className="health-label text-health-leaf">Human-Grade Verified</span>
                </div>
                <div className="space-y-2">
                   <p className="health-label text-[10px] opacity-60">Bio-Availability Index</p>
                   <p className="font-serif text-3xl font-bold text-health-leaf tracking-tight">Grade A+</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section id="story" className="py-32 px-12 lg:px-24 bg-health-cream overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative">
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-health-sage/10 rounded-full blur-3xl" />
              <div className="relative space-y-12">
                <span className="health-label text-health-olive">// Science & Sustenance</span>
                <h2 className="text-5xl md:text-6xl font-serif font-bold text-health-leaf leading-tight italic">Engineering Meals for <br />Better Lives</h2>
                <div className="prose prose-health prose-lg text-health-muted italic space-y-6">
                  <p>
                    Since our founding in 2019, we have been committed to making elite nutrition easy and accessible for the human body. We believe that every individual deserves meals that are biologically optimized and delicious.
                  </p>
                  <p>
                    Our journey began with a clinical observation: people needed nutritious food options that were not just "healthy" by label, but bio-available and functional in their daily lives.
                  </p>
                  <p>
                    This prompted us to create HealthyChef—a portal for nutritionist-led meal planning that prioritizes human vitality and long-term health metrics.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-8 mt-12">
                <div className="health-card p-2 shadow-xl">
                  <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600&h=800" alt="Clinically Curated Meals" className="w-full rounded-[18px] grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                </div>
                <div className="health-card p-6 bg-health-leaf text-white border-none">
                  <h4 className="font-serif text-2xl mb-2">Since 2019</h4>
                  <p className="text-xs opacity-60 uppercase tracking-widest font-bold">Bio-Design Center</p>
                </div>
              </div>
              <div className="space-y-8">
                <div className="health-card p-8 bg-health-sage/10 border-none">
                  <p className="font-serif italic text-health-leaf text-lg">"Bridging clinical science with culinary delight to help humans thrive."</p>
                </div>
                <div className="health-card p-2 shadow-xl">
                  <img src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=600&h=800" alt="Human-Grade Nutrients" className="w-full rounded-[18px]" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-32 px-12 lg:px-24 bg-health-bg">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <span className="health-label text-health-sage mb-6 block">// Clinical Expertise</span>
          <h2 className="text-5xl font-serif font-bold text-health-leaf mb-8">Registered Dietitians & Chefs</h2>
          <p className="text-xl text-health-muted leading-relaxed italic">
            Our clinical nutritionists work in tandem with gourmet chefs to engineer dietary protocols that are not only healthy, but also optimize human cellular function and metabolic health.
          </p>
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          {[
            { img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800&h=1000", role: "Clinical Director", name: "Lead Nutritionist" },
            { img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800&h=1000", role: "Metabolic Specialist", name: "RD Dietitian" },
            { img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800&h=1000", role: "Human Ops Lead", name: "Health Strategist" },
          ].map((member, i) => (
            <div key={i} className="health-card p-3 group overflow-hidden">
              <div className="overflow-hidden rounded-[20px] mb-6">
                <img src={member.img} alt={member.name} className="w-full aspect-[4/5] object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
              </div>
              <div className="px-4 pb-4">
                <p className="health-label text-health-sage mb-1">{member.role}</p>
                <p className="font-serif font-bold text-2xl text-health-leaf">{member.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-32 px-12 lg:px-24 bg-health-leaf text-white relative">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-32 items-center">
          <div className="space-y-12">
            <div className="space-y-6">
              <span className="health-label text-white/40">// Optimization Vision</span>
              <h2 className="text-6xl font-serif font-bold italic leading-tight uppercase">Human Potential</h2>
              <p className="text-xl text-white/80 leading-relaxed italic">
                Our vision is to become the clinical standard for individuals seeking optimal human nutrition—moving beyond simple calories to bio-available meal plans.
              </p>
              <p className="text-white/60 leading-relaxed">
                We provide the intelligence layer between your health goals and your daily meals. Our plans are clinical-grade, designed to solve systemic health issues through the most fundamental human need: better food.
              </p>
            </div>
            <div className="health-card bg-white/5 border-none p-12 backdrop-blur-sm">
              <p className="font-serif italic text-2xl">
                "HealthyChef isn't just about food—it's a clinical experience designed to push your biology to its peak."
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="health-card p-4 bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <img src="https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=1200&h=800" alt="Nutritional Intelligence" className="w-full rounded-[20px]" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute -top-12 -right-12 w-48 h-48 border-[20px] border-health-sage opacity-20 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-12 lg:px-24 bg-health-cream/50 relative">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-12">
           {[
             { label: "Clinical", title: "Metabolic Logic", icon: Terminal, desc: "Evidence-based algorithms ensuring optimal macro distribution." },
             { label: "Bio-First", title: "Nutrient Density", icon: Layers, desc: "Bio-available ingredient tracking for maximum human uptake." },
             { label: "Individual", title: "Human Analytics", icon: Activity, desc: "Tailored nutritional roadmaps for exclusive member needs." },
             { label: "Protocol", title: "Clinical Reports", icon: Receipt, desc: "Detailed nutritional statements that track your bio-progress." }
           ].map((item, i) => (
             <div key={i} className="group cursor-default">
                <div className="w-16 h-16 bg-health-sage/10 rounded-2xl flex items-center justify-center text-health-leaf mb-8 group-hover:bg-health-olive group-hover:text-white transition-all duration-500">
                  <item.icon size={28} />
                </div>
                <p className="health-label mb-3 text-health-sage">{item.label}</p>
                <h3 className="text-2xl font-serif font-bold mb-4">{item.title}</h3>
                <p className="text-health-muted leading-relaxed italic">{item.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* Refined Footer */}
      <footer className="py-32 px-12 lg:px-24 bg-health-leaf text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-1/2 h-full bg-white opacity-[0.02] -skew-x-12 translate-x-1/2" />
         <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-end gap-16 relative z-10">
            <div className="max-w-lg">
               <h2 className="text-6xl font-serif font-bold leading-[1] mb-8 italic">
                 Grow with <br /> Confidence.
               </h2>
               <p className="health-label text-white/50 mb-4 tracking-widest">© 2026 HEALTHYCHEF / ARTISANAL DATA PROTOCOLS</p>
            </div>
            <div className="flex gap-16 text-white/80">
               <div className="flex flex-col gap-3">
                 <span className="health-label text-white/40">Philosophy</span>
                 <span className="font-serif italic text-lg">Organic First</span>
               </div>
               <div className="flex flex-col gap-3">
                 <span className="health-label text-white/40">Response</span>
                 <span className="font-serif italic text-lg">Always Mindful</span>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}
