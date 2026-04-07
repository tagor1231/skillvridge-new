import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  GraduationCap,
  TrendingUp,
  BookOpen,
  Tractor,
  ShieldCheck,
} from 'lucide-react';
import heroImage from '../assets/hero.png';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#f7f1ff] overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full h-[900px] overflow-hidden">
  <img
    src={heroImage}
    alt="SkillBridge Hero"
    className="w-full h-full object-cover object-[center_70%]"
  />

  {/* BUTTONS */}
  <div className="absolute left-[520px] top-[440px] flex gap-7 z-20">
    <Link
      to="/register"
      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-7 py-3 rounded-full font-semibold shadow-xl hover:scale-105 hover:shadow-2xl transition-all"
    >
      Get Started Free
    </Link>

    <Link
      to="/jobs"
      className="border-2 border-white text-white px-7 py-3 rounded-full font-semibold backdrop-blur-md hover:bg-white hover:text-purple-700 transition-all"
    >
      Browse Jobs
    </Link>
  </div>
  {/* CARDS */}
   <div className="absolute right-[230px] top-[130px] z-20 bg-white/20 backdrop-blur-xl p-6 rounded-3xl shadow-2xl shadow-pink-500/20 flex gap-6 animate">

  <div className="bg-white rounded-2xl p-6 w-[220px] text-center shadow-md hover:-translate-y-2 hover:scale-105 hover:shadow-2xl hover:shadow-pink-400/40 transition-all duration-500">
    <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-purple-100 rounded-xl">
      💼
    </div>
    <h2 className="text-2xl font-bold text-purple-700">5,000+</h2>
    <p className="font-semibold text-gray-700">Job Listings</p>
    <p className="text-sm text-gray-500 mt-1">
      Find opportunities from top companies.
    </p>
  </div>

  <div className="bg-white rounded-2xl p-6 w-[220px] text-center shadow-md hover:-translate-y-2 hover:scale-105 hover:shadow-2xl hover:shadow-pink-400/40 transition-all duration-500">
    <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-purple-100 rounded-xl">
      🎓
    </div>
    <h2 className="text-2xl font-bold text-purple-700">500+</h2>
    <p className="font-semibold text-gray-700">Training Courses</p>
    <p className="text-sm text-gray-500 mt-1">
      Learn in-demand skills online.
    </p>
  </div>

</div>
</section>

      {/* Choose Role Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-purple-700 font-bold text-2xl mb-2">Choose Your Role</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Who is SkillBridge for?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/60 hover:-translate-y-2 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center">
                  <BookOpen className="text-amber-600" size={22} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">For Students</h3>
              </div>
              <p className="text-gray-600 min-h-[72px]">
                Get internships and training to kickstart your career.
              </p>
              <button className="mt-5 w-full bg-amber-400 hover:bg-amber-500 text-white font-semibold py-3 rounded-xl transition-all shadow">
                Find Internships
              </button>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/60 hover:-translate-y-2 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
                  <Tractor className="text-green-600" size={22} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">For Farmers</h3>
              </div>
              <p className="text-gray-600 min-h-[72px]">
                Learn specialized farming skills with government support.
              </p>
              <button className="mt-5 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all shadow">
                Get Farm Skills
              </button>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/60 hover:-translate-y-2 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Briefcase className="text-purple-700" size={22} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Job Seekers</h3>
              </div>
              <p className="text-gray-600 min-h-[72px]">
                Discover full-time and part-time positions matching your skills.
              </p>
              <button className="mt-5 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all shadow">
                Explore Careers
              </button>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/60 hover:-translate-y-2 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center">
                  <ShieldCheck className="text-rose-500" size={22} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">For Providers</h3>
              </div>
              <p className="text-gray-600 min-h-[72px]">
                Connect with talented candidates looking for jobs.
              </p>
              <button className="mt-5 w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl transition-all shadow">
                Post Jobs
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-purple-700 font-bold text-2xl mb-2">All-in-One Platform</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Unlock Your Potential Today
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/60 hover:-translate-y-2 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Briefcase className="text-blue-600" size={22} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Job Opportunities</h3>
              </div>
              <p className="text-gray-600 leading-relaxed min-h-[96px]">
                Access thousands of full-time, part-time, and remote job listings.
              </p>
              <button className="mt-4 w-full border border-purple-200 bg-white hover:bg-purple-50 text-purple-700 font-semibold py-3 rounded-xl transition-all">
                Explore Jobs
              </button>
            </div>

            <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/60 hover:-translate-y-2 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center">
                  <GraduationCap className="text-violet-600" size={22} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Skill Training</h3>
              </div>
              <p className="text-gray-600 leading-relaxed min-h-[96px]">
                Gain in-demand skills like web development, digital marketing, and more.
              </p>
              <button className="mt-4 w-full border border-violet-200 bg-white hover:bg-violet-50 text-violet-700 font-semibold py-3 rounded-xl transition-all">
                Start Learning
              </button>
            </div>

            <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/60 hover:-translate-y-2 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-pink-100 flex items-center justify-center">
                  <TrendingUp className="text-pink-600" size={22} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Career Guidance</h3>
              </div>
              <p className="text-gray-600 leading-relaxed min-h-[96px]">
                AI-powered career counseling to help you build a successful career path.
              </p>
              <button className="mt-4 w-full border border-pink-200 bg-white hover:bg-pink-50 text-pink-600 font-semibold py-3 rounded-xl transition-all">
                Get Advice
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-purple-700 font-bold text-2xl mb-2">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Get Started in 3 Easy Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 border-b-4 border-b-blue-500 text-center hover:-translate-y-2 hover:shadow-2xl transition-all">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              1
           </div>
           <h3 className="text-2xl font-bold text-gray-900 mb-3">Sign Up</h3>
           <p className="text-gray-600">
              Create your account and choose your role - Student, Farmer, Job Seeker, or Provider.
           </p>
          </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 border-b-4 border-b-blue-500 text-center hover:-translate-y-2 hover:shadow-2xl transition-all">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            2
            </div>
             <h3 className="text-2xl font-bold text-gray-900 mb-3">Build Profile</h3>
             <p className="text-gray-600">
                Complete your profile with skills, experience, and preferences for better recommendations.
             </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 border-b-4 border-b-blue-500 text-center hover:-translate-y-2 hover:shadow-2xl transition-all">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            3
            </div>
             <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Growing</h3>
             <p className="text-gray-600">
               Apply for jobs, join courses, and achieve your goals through one smart platform.
             </p>
           </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-lg md:text-xl text-purple-100 mb-8">
            Join thousands of successful users who started their journey with SkillBridge.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-purple-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            <span>Get Started Now</span>
            <ArrowRight size={22} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1d1633] text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-2xl mb-4">SkillBridge</h3>
              <p className="text-sm leading-7">
                Empowering careers through skills and opportunities.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-lg">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/jobs" className="hover:text-white transition">Find Jobs</Link></li>
                <li><Link to="/courses" className="hover:text-white transition">Browse Courses</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Sign Up</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-lg">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-lg">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-10 pt-6 text-center text-sm">
            <p>&copy; 2025 SkillBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
