"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import VPrism from "@/components/block/v-prism";
import FlipText from "@/components/block/flip-text";
import {
  Bone,
  FlaskConical,
  ClipboardCheck,
  GraduationCap,
  Sparkles,
  PhoneCall,
  Clock,
  MapPin,
  CheckCircle2,
  BookOpen,
  Send,
  Zap,
  ArrowRight
} from "lucide-react";

export default function Home() {
  const [selectedGrade, setSelectedGrade] = useState("grade10");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Grade specifics
  const gradeData: Record<string, { title: string; subtitle: string; topics: string[]; schedule: string }> = {
    grade6: {
      title: "Grade 6 Science Foundation",
      subtitle: "Building core curiosity in biological and physical sciences",
      topics: ["Living Things & Environment", "States of Matter", "Energy Sources", "Human Body Systems"],
      schedule: "Saturdays 8:00 AM - 10:00 AM (Physical & Online)"
    },
    grade7: {
      title: "Grade 7 Science Concepts",
      subtitle: "In-depth understanding of scientific fundamentals and experiments",
      topics: ["Plant Nutrition & Photosynthesis", "Elements & Compounds", "Forces & Motion", "Human Digestive System"],
      schedule: "Saturdays 10:30 AM - 12:30 PM (Physical & Online)"
    },
    grade8: {
      title: "Grade 8 Science Mastery",
      subtitle: "Strengthening analytical skills for upper secondary science",
      topics: ["Cellular Structure", "Chemical Reactions & Acids/Bases", "Light & Reflection", "Microorganisms"],
      schedule: "Sundays 8:00 AM - 10:00 AM (Physical & Online)"
    },
    grade9: {
      title: "Grade 9 Science Advancement",
      subtitle: "Bridging foundational science to Ordinary Level syllabus",
      topics: ["Human Nervous & Circulatory System", "Atomic Structure & Periodic Table", "Electricity & Circuits", "Ecology"],
      schedule: "Sundays 10:30 AM - 12:30 PM (Physical & Online)"
    },
    grade10: {
      title: "Grade 10 O/L Theory & Revision",
      subtitle: "Complete unit-by-unit syllabus coverage with structured model papers",
      topics: ["Genetics & Inheritance", "Chemical Kinetics & Stoichiometry", "Electromagnetism & Waves", "Excretory & Reproductive Systems"],
      schedule: "Fridays 3:30 PM - 6:00 PM / Sundays 1:30 PM - 4:00 PM"
    },
    grade11: {
      title: "Grade 11 O/L Fast-Track & Speed Revision",
      subtitle: "Past paper practice, target questions, time management & paper discussion",
      topics: ["10-Year O/L Past Paper Seminar", "Model Question Paper Discussions", "High-Yield Memory Techniques", "Practical & Experiment Review"],
      schedule: "Saturdays 1:30 PM - 5:00 PM (Theory + Speed Revision)"
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Announcement Banner */}
      <div className="bg-primary text-primary-foreground text-center py-2 px-4 text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
        <Sparkles className="size-4 animate-pulse" />
        <span>New 2025/2026 O/L Science Batches Enrolling Now!</span>
        <Badge variant="secondary" className="ml-2 hidden sm:inline-flex text-xs">
          Physical & Online
        </Badge>
      </div>

      {/* Interactive Glowing Dark Hero Section */}
      <section className="relative overflow-hidden bg-black text-white pt-12 pb-16 lg:pt-20 lg:pb-24">
        {/* Interactive VPrism Glass Canvas Display */}
        <div className="absolute inset-0 z-0 opacity-100 pointer-events-auto">
          <VPrism className="h-full w-full" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 pointer-events-none">
          <div className="max-w-xl space-y-6 bg-slate-950/80 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md pointer-events-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1 text-xs font-semibold text-slate-200">
              <GraduationCap className="size-4 text-primary" />
              <span>Shanika Nandasiri (B.Sc. Natural Sciences)</span>
            </div>

            {/* Clear Heading with FlipText effect */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Science with <br />
              <span className="text-primary inline-block pt-1">
                <FlipText duration={2.5}>Shanika Nandasiri</FlipText>
              </span>
            </h1>

            {/* Simple concise description */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Interactive 3D anatomy, hands-on simulations, and weekly online papers tailored for O/L Science success.
            </p>

            {/* Two Clear CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button size="lg" className="h-11 px-6 text-sm font-bold shadow-lg bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link href="/signup">
                  Join Classes Now <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-11 px-5 text-sm font-medium border-slate-700 bg-slate-900/80 text-white hover:bg-slate-800" asChild>
                <Link href="#classes">
                  View Timetable
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Class Grades & Timetable Section */}
      <section id="classes" className="py-20 bg-muted/30 border-y">
        <div className="mx-auto max-w-6xl px-4 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold">
              Structured Curriculum
            </Badge>
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Class Schedules & Grade Details
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Comprehensive Science classes designed specifically for Sri Lankan syllabus (English & Sinhala medium support). Select your grade to view topics & times.
            </p>
          </div>

          {/* Grade Selector Tabs */}
          <div className="space-y-8">
            <div className="flex justify-center">
              <Tabs value={selectedGrade} onValueChange={setSelectedGrade} className="w-full max-w-3xl">
                <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto p-1 bg-muted/80">
                  <TabsTrigger value="grade6" className="py-2 text-xs sm:text-sm">Grade 6</TabsTrigger>
                  <TabsTrigger value="grade7" className="py-2 text-xs sm:text-sm">Grade 7</TabsTrigger>
                  <TabsTrigger value="grade8" className="py-2 text-xs sm:text-sm">Grade 8</TabsTrigger>
                  <TabsTrigger value="grade9" className="py-2 text-xs sm:text-sm">Grade 9</TabsTrigger>
                  <TabsTrigger value="grade10" className="py-2 text-xs sm:text-sm font-bold text-primary">Grade 10</TabsTrigger>
                  <TabsTrigger value="grade11" className="py-2 text-xs sm:text-sm font-bold text-primary">Grade 11 O/L</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Selected Grade Detail Card */}
            {gradeData[selectedGrade] && (
              <Card className="max-w-4xl mx-auto border-2 shadow-lg">
                <CardHeader className="bg-muted/20 border-b">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl font-bold">{gradeData[selectedGrade].title}</CardTitle>
                      <CardDescription className="text-sm mt-1">{gradeData[selectedGrade].subtitle}</CardDescription>
                    </div>
                    <Button size="lg" className="shadow-md" asChild>
                      <Link href="/signup">
                        Enroll in {selectedGrade.toUpperCase().replace("GRADE", "Grade ")}
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Topics Covered */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <BookOpen className="size-4 text-primary" /> Key Core Units Covered
                      </h4>
                      <ul className="space-y-2">
                        {gradeData[selectedGrade].topics.map((topic, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Schedule & Mode */}
                    <div className="space-y-3 bg-muted/40 p-4 rounded-xl border">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Clock className="size-4 text-primary" /> Weekly Schedule & Venues
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold text-foreground">
                          {gradeData[selectedGrade].schedule}
                        </p>
                        <div className="pt-2 text-xs text-muted-foreground space-y-1">
                          <p className="flex items-center gap-1.5">
                            <MapPin className="size-3.5 text-primary" /> Physical Institutes (Apex Institute - Nugegoda & Sussex)
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Zap className="size-3.5 text-amber-500" /> Live High-Definition Zoom Streaming for Islandwide Students
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Interactive Platform Tools Showcase */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-6xl px-4 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" className="px-3 py-1 text-xs font-semibold">
              Modern Tech-Enabled Learning
            </Badge>
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Why Students Excel in Our Science Classes
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Combining traditional classroom excellence with cutting-edge digital learning tools.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* 3D Anatomy */}
            <Card className="flex flex-col justify-between border-2 transition-all hover:border-primary/50 hover:shadow-xl group">
              <CardHeader>
                <div className="size-12 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Bone className="size-6" />
                </div>
                <CardTitle className="text-xl">Interactive 3D Anatomy</CardTitle>
                <CardDescription className="text-sm">
                  Visualize organs, skeletal structures, and biological systems with complete 360-degree rotation and zoom.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" className="w-full justify-between" asChild>
                  <Link href="/anatomy">
                    Explore 3D Models <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Science Simulations */}
            <Card className="flex flex-col justify-between border-2 transition-all hover:border-primary/50 hover:shadow-xl group">
              <CardHeader>
                <div className="size-12 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FlaskConical className="size-6" />
                </div>
                <CardTitle className="text-xl">Hands-on Simulations</CardTitle>
                <CardDescription className="text-sm">
                  Perform virtual lab experiments safely. Test pH indicators, chemical reactions, and physical motion interactively.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" className="w-full justify-between" asChild>
                  <Link href="/simulations">
                    Try Lab Simulations <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Weekly MCQ Evaluation */}
            <Card className="flex flex-col justify-between border-2 transition-all hover:border-primary/50 hover:shadow-xl group">
              <CardHeader>
                <div className="size-12 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ClipboardCheck className="size-6" />
                </div>
                <CardTitle className="text-xl">Weekly Quiz Platform</CardTitle>
                <CardDescription className="text-sm">
                  Instant paper submission, automated lock-in timer, and personal score breakdown to track O/L performance weekly.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" className="w-full justify-between" asChild>
                  <Link href="/quiz">
                    Start Weekly Quiz <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Us & Inquiries Section */}
      <section id="contact" className="py-20 bg-muted/40 border-t">
        <div className="mx-auto max-w-6xl px-4 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold">
              Get In Touch
            </Badge>
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Contact Shanika Nandasiri Science Classes
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Have questions regarding class admissions, class links, or physical hall registration? Reach out to us directly.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            {/* Contact Details Cards */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="p-5 border-l-4 border-l-primary">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary shrink-0">
                    <PhoneCall className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base">Direct Hotline / WhatsApp</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Call or WhatsApp for quick assistance</p>
                    <div className="mt-2 space-y-1">
                      <a href="tel:0718855123" className="block text-sm font-semibold hover:text-primary transition-colors">
                        📞 071 88 55 123
                      </a>
                      <a href="tel:0719955123" className="block text-sm font-semibold hover:text-primary transition-colors">
                        📞 071 99 55 123
                      </a>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-5 border-l-4 border-l-indigo-500">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0">
                    <MapPin className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base">Class Locations</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Physical Institutes & Online Zoom</p>
                    <p className="text-sm font-medium mt-2">
                      Apex Institute - Nugegoda & Sussex College
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Islandwide Online Live Zoom lectures available with LMS recording access.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-5 border-l-4 border-l-emerald-500">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400 shrink-0">
                    <GraduationCap className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base">Qualifications</h4>
                    <p className="text-sm font-medium mt-1">
                      Shanika Nandasiri (B.Sc. Natural Sciences)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Years of proven experience in producing Island Rank & A-Grade O/L Science results.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Inquiry Form */}
            <div className="lg:col-span-7">
              <Card className="shadow-lg border-2">
                <CardHeader>
                  <CardTitle className="text-xl">Send an Inquiry / Join Class</CardTitle>
                  <CardDescription>
                    Fill out your details and our class team will call/WhatsApp you back shortly.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {contactSubmitted ? (
                    <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 text-center space-y-3">
                      <CheckCircle2 className="size-12 mx-auto text-emerald-600 dark:text-emerald-400" />
                      <h4 className="font-bold text-lg text-emerald-900 dark:text-emerald-100">Thank You!</h4>
                      <p className="text-sm text-emerald-800 dark:text-emerald-200">
                        Your inquiry has been received. Our team will contact you on your provided phone number shortly.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setContactSubmitted(false)}
                        className="mt-2"
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setContactSubmitted(true);
                      }}
                      className="space-y-4"
                    >
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold">Student / Parent Name</label>
                          <input
                            required
                            type="text"
                            placeholder="e.g. Kasun Perera"
                            className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold">Phone / WhatsApp Number</label>
                          <input
                            required
                            type="tel"
                            placeholder="07x xxx xxxx"
                            className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold">Target Grade</label>
                          <select className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none">
                            <option value="grade6">Grade 6</option>
                            <option value="grade7">Grade 7</option>
                            <option value="grade8">Grade 8</option>
                            <option value="grade9">Grade 9</option>
                            <option value="grade10">Grade 10</option>
                            <option value="grade11">Grade 11 (O/L)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold">Preferred Learning Mode</label>
                          <select className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none">
                            <option value="physical">Physical Class (Apex / Sussex)</option>
                            <option value="online">Online Zoom Class</option>
                            <option value="both">Both / Undecided</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold">Message or Specific Questions (Optional)</label>
                        <textarea
                          rows={3}
                          placeholder="Ask about class fees, study materials, zoom access..."
                          className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none resize-none"
                        />
                      </div>

                      <Button type="submit" className="w-full h-11 text-base shadow-md">
                        <Send className="size-4 mr-2" /> Submit Inquiry
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Footer */}
      <footer className="bg-slate-950 text-slate-200 border-t border-slate-800 pt-16 pb-12">
        <div className="mx-auto max-w-6xl px-4 space-y-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Col 1: Brand & Bio */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-lg text-white">
                <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-base font-extrabold">SN</span>
                <span>Shanika Nandasiri</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                B.Sc. Natural Sciences specialist teacher committed to empowering Sri Lankan students in Science from Grade 6 up to O/L exam victory.
              </p>
              <div className="pt-2 text-xs text-slate-400 space-y-2">
                <p className="flex items-center gap-2">
                  <PhoneCall className="size-3.5 text-primary" /> 071 88 55 123 / 071 99 55 123
                </p>
                {/* Social Media Links */}
                <div className="flex items-center gap-3 pt-1">
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    title="Facebook Page (Link coming soon)"
                    className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-800"
                  >
                    <svg className="size-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    title="YouTube Channel (Link coming soon)"
                    className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-800"
                  >
                    <svg className="size-4 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">Navigation</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link href="/" className="hover:text-white transition-colors">Home Page</Link></li>
                <li><Link href="#classes" className="hover:text-white transition-colors">Class Timetable & Grades</Link></li>
                <li><Link href="#features" className="hover:text-white transition-colors">Interactive Tools</Link></li>
                <li><Link href="#contact" className="hover:text-white transition-colors">Contact Us & Locations</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">Student Registration</Link></li>
              </ul>
            </div>

            {/* Col 3: Interactive Hub */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">Interactive Modules</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <Link href="/anatomy" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Bone className="size-3.5 text-blue-400" /> 3D Human Anatomy Viewer
                  </Link>
                </li>
                <li>
                  <Link href="/simulations" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <FlaskConical className="size-3.5 text-purple-400" /> pH & Lab Simulations
                  </Link>
                </li>
                <li>
                  <Link href="/quiz" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <ClipboardCheck className="size-3.5 text-emerald-400" /> Weekly Online MCQ Papers
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Grades & Batches */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">Batches & Grades</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>Grade 6 & 7 Science Foundation</li>
                <li>Grade 8 & 9 Science Mastery</li>
                <li>Grade 10 O/L Science Theory</li>
                <li>Grade 11 O/L Fast-Track & Revision</li>
                <li>English & Sinhala Medium Support</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} Science with Shanika Nandasiri (B.Sc. Natural Sciences). All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/login" className="hover:text-slate-300">Teacher / Student Login</Link>
              <span>•</span>
              <Link href="/signup" className="hover:text-slate-300">Enroll Today</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
