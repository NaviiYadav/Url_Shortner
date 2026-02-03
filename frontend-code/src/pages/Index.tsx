import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Link2 } from 'lucide-react';
import { BarChart3, QrCode, Zap, ShieldCheck, Globe } from "lucide-react";
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import UrlShortenerForm from '@/components/forms/UrlShortenerForm';
import QrCodeGenerator from '@/components/forms/QrCodeGenerator';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 overflow-hidden relative">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto mb-12"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 text-sm font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span>Now with AI-powered analytics</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Short links,{' '}
              <span className="gradient-text">Big impact</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Create powerful short links, QR codes, and track your audience with real-time analytics. The modern link management platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="h-14 px-8 text-base shadow-glow hover:shadow-glow transition-shadow">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* URL Shortener Form */}
          <UrlShortenerForm />

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
          >
            {[
              { value: '10M+', label: 'Links Created' },
              { value: '500M+', label: 'Clicks Tracked' },
              { value: '150K+', label: 'Active Users' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* QR Code Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Generate <span className="gradient-text">QR Codes</span> Instantly
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Create beautiful, customizable QR codes for any URL. Perfect for marketing, business cards, and more.
            </p>
          </motion.div>

          <QrCodeGenerator />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg">
              Powerful features to help you manage, track, and optimize your links
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Link2,
                title: "Smart URL Shortening",
                desc: "Create short, memorable links instantly. Same URL? Get the same short link.",
              },
              {
                icon: BarChart3,
                title: "Detailed Analytics",
                desc: "Track clicks, locations, devices, and more with real-time analytics.",
              },
              {
                icon: QrCode,
                title: "QR Code Generation",
                desc: "Generate QR codes for any URL. Perfect for print and offline marketing.",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                desc: "Optimized redirects with caching for the fastest possible experience.",
              },
              {
                icon: ShieldCheck,
                title: "Secure & Private",
                desc: "Your links are protected. Only you can see your analytics and manage your URLs.",
              },
              {
                icon: Globe,
                title: "Custom Short Links",
                desc: "Create branded short links that reflect your identity.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group glass rounded-2xl p-8 hover:shadow-glow transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-strong rounded-3xl p-8 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to get started?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Join thousands of businesses and creators who trust LinkSnip for their link management needs.
              </p>
              <Link to="/auth?mode=signup">
                <Button size="lg" className="h-14 px-8 text-base shadow-glow">
                  Start for Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Link2 className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold">LinkSnip</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} LinkSnip. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
