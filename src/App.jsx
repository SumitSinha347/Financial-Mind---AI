import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, addDoc } from "firebase/firestore";

// --- Firebase Configuration ---
// IMPORTANT: For local development in VS Code, paste your own Firebase project config here.
// You can get this from your Firebase project settings > General.
const localFirebaseConfig = {
  apiKey: "AIzaSyDlahlgHFkqMkFr29yNkLD0jrqQX49VYEw",
  authDomain: "finmind-ai-93d05.firebaseapp.com",
  projectId: "finmind-ai-93d05",
  storageBucket: "finmind-ai-93d05.firebasestorage.app",
  messagingSenderId: "464070679052",
  appId: "1:464070679052:web:471e247a91c34a0bad6c29",
  measurementId: "G-QHYGY095KL"
};

// This logic checks if the code is running in the Gemini environment or locally.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'local-dev-app';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : localFirebaseConfig;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- SVG Icons ---
const OverviewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ExpensesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const InsightsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const OpportunitiesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const SendIcon = () => <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2 .01 7z" /></svg>;
const BotIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-blue-600"><path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" fillOpacity="0.3"/><path d="M12 15.5C12.8284 15.5 13.5 14.8284 13.5 14C13.5 13.1716 12.8284 12.5 12 12.5C11.1716 12.5 10.5 13.1716 10.5 14C10.5 14.8284 11.1716 15.5 12 15.5Z" fill="#4A90E2"/><path d="M16 11.5C16.8284 11.5 17.5 10.8284 17.5 10C17.5 9.17157 16.8284 8.5 16 8.5C15.1716 8.5 14.5 9.17157 14.5 10C14.5 10.8284 15.1716 11.5 16 11.5Z" fill="#4A90E2"/><path d="M8 11.5C8.82843 11.5 9.5 10.8284 9.5 10C9.5 9.17157 8.82843 8.5 8 8.5C7.17157 8.5 6.5 9.17157 6.5 10C6.5 10.8284 7.17157 11.5 8 11.5Z" fill="#4A90E2"/></svg>;

// --- Main App Component ---
export default function App() {
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        }
      } else {
        await signInAnonymously(auth);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-gray-50"><p>Loading...</p></div>;
  }

  if (userProfile) {
    return <DashboardComponent userProfile={userProfile} userId={userId} />;
  }

  if (showOnboarding) {
      return <OnboardingComponent userId={userId} onComplete={setUserProfile} />
  }

  return <LandingComponent onGetStarted={() => setShowOnboarding(true)} />;
}

// --- Onboarding and Landing Page Components ---
const LandingComponent = ({ onGetStarted }) => (
    <div className="bg-gradient-to-br from-blue-600 to-teal-500 min-h-screen flex flex-col justify-center items-center text-white p-4">
        <div className="text-center max-w-2xl">
            <span className="text-sm font-bold bg-white/20 text-white py-1 px-3 rounded-full">✨ AI-Powered Financial Assistant</span>
            <h1 className="text-4xl md:text-6xl font-extrabold mt-4">Smart Money Management for Students</h1>
            <p className="mt-4 text-lg text-blue-100">Take control of your finances with AI-powered insights, automatic expense tracking, and personalized recommendations for scholarships and side hustles.</p>
            <button onClick={onGetStarted} className="mt-8 bg-white text-blue-600 font-bold py-3 px-8 rounded-lg text-lg hover:bg-gray-100 transition-transform transform hover:scale-105">Get Started Free →</button>
        </div>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16 text-center">
            <div><p className="text-3xl font-bold">10,000+</p><p className="text-blue-200">Students Helped</p></div>
            <div><p className="text-3xl font-bold">₹50L+</p><p className="text-blue-200">Money Saved</p></div>
            <div><p className="text-3xl font-bold">500+</p><p className="text-blue-200">Scholarships Found</p></div>
            <div><p className="text-3xl font-bold">4.9★</p><p className="text-blue-200">User Rating</p></div>
        </div>
    </div>
);

const OnboardingComponent = ({ userId, onComplete }) => {
    const [name, setName] = useState('');
    const [income, setIncome] = useState('');
    const [savingsGoal, setSavingsGoal] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !income || !savingsGoal || !userId) return;
        const userProfileData = { name, income: Number(income), savingsGoal: Number(savingsGoal) };
        try {
            const userDocRef = doc(db, 'artifacts', appId, 'users', userId);
            await setDoc(userDocRef, userProfileData);
            onComplete(userProfileData);
        } catch (error) {
            console.error("Error saving user profile:", error);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 text-center">Welcome!</h2>
                <p className="text-gray-600 text-center mb-6">Let's set up your financial profile.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Priya Sharma" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Your Estimated Monthly Income (₹)</label>
                        <input type="number" value={income} onChange={e => setIncome(e.target.value)} placeholder="e.g., 15000" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Your Monthly Savings Goal (₹)</label>
                        <input type="number" value={savingsGoal} onChange={e => setSavingsGoal(e.target.value)} placeholder="e.g., 5000" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">Continue to Dashboard</button>
                </form>
            </div>
        </div>
    );
};

// --- Dashboard Main Component ---
const DashboardComponent = ({ userProfile, userId }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [expenses, setExpenses] = useState([]);
    
    useEffect(() => {
        if (!userId) return;
        const expensesColRef = collection(db, 'artifacts', appId, 'users', userId, 'expenses');
        const unsubscribe = onSnapshot(expensesColRef, (snapshot) => {
            const userExpenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setExpenses(userExpenses);
        });
        return () => unsubscribe();
    }, [userId]);
    
    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewComponent userProfile={userProfile} expenses={expenses} />;
            case 'expenses':
                return <ExpensesComponent userId={userId} expenses={expenses} />;
            case 'ai-insights':
                return <AIInsightsComponent userProfile={userProfile} expenses={expenses} />;
            case 'opportunities':
                return <OpportunitiesComponent />;
            default:
                return <OverviewComponent userProfile={userProfile} expenses={expenses} />;
        }
    };

    return (
         <div className="bg-gray-50 min-h-screen font-sans">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Header userName={userProfile.name} />
                <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="mt-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

// --- Reusable Dashboard UI Components ---
const Header = ({ userName }) => (
  <header className="flex justify-between items-center">
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Welcome back, {userName}! 👋</h1>
      <p className="text-gray-500">Here's your financial overview for today.</p>
    </div>
    <div className="flex items-center space-x-4">
      <button className="p-2 rounded-full hover:bg-gray-100"><SettingsIcon /></button>
      <button className="p-2 rounded-full hover:bg-gray-100"><UserIcon /></button>
    </div>
  </header>
);

const NavigationTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [ { id: 'overview', label: 'Overview', icon: <OverviewIcon /> }, { id: 'expenses', label: 'Expenses', icon: <ExpensesIcon /> }, { id: 'ai-insights', label: 'AI Insights', icon: <InsightsIcon /> }, { id: 'opportunities', label: 'Opportunities', icon: <OpportunitiesIcon /> } ];
  return (
    <nav className="mt-8 border-b border-gray-200">
      <ul className="flex space-x-8">
        {tabs.map(tab => (
          <li key={tab.id}><button onClick={() => setActiveTab(tab.id)} className={`flex items-center py-4 px-1 text-sm font-medium transition-colors duration-200 ${ activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'}`}>{tab.icon} {tab.label}</button></li>
        ))}
      </ul>
    </nav>
  );
};

// --- Detailed Page Components ---

const OverviewComponent = ({ userProfile, expenses }) => {
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const currentSavings = userProfile.income - totalExpenses;
    const savingsProgress = Math.max(0, (currentSavings / userProfile.savingsGoal) * 100);
    const savingsRate = userProfile.income > 0 ? (currentSavings / userProfile.income) * 100 : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Monthly Income" value={`₹${userProfile.income.toLocaleString()}`} subtitle="Your total monthly income" />
            <StatCard title="Total Expenses" value={`₹${totalExpenses.toLocaleString()}`} subtitle="This month's spending" />
            <StatCard title="Current Savings" value={`₹${currentSavings.toLocaleString()}`} subtitle={`+₹${currentSavings.toLocaleString()} this month`} />
            <StatCard title="Upcoming Bills" value="₹8,000" subtitle="Due in next 7 days" />

            <div className="md:col-span-2 lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-800">Savings Goal Progress</h3>
                <div className="flex justify-between items-center mt-2">
                    <p className="text-2xl font-bold text-gray-900">₹{currentSavings.toLocaleString()}</p>
                    <p className="text-gray-500">of ₹{userProfile.savingsGoal.toLocaleString()}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${savingsProgress}%` }}></div></div>
                <p className="text-sm text-gray-500 mt-1">{savingsProgress.toFixed(1)}% complete + ₹{(userProfile.savingsGoal - currentSavings).toLocaleString()} remaining</p>
            </div>

            <div className="md:col-span-2 lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-800">Monthly Budget Health</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{savingsRate.toFixed(1)}%</p>
                 <p className="text-gray-500">Savings Rate</p>
                <p className="text-sm text-gray-500 mt-2">{savingsRate > 20 ? 'Excellent! You are saving well.' : 'Good start, keep it up!'}</p>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, subtitle }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
);

const ExpensesComponent = ({ userId, expenses }) => {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!amount || !category || !description || !userId) return;
        const newExpense = { amount: Number(amount), category, description, date: new Date().toISOString().split('T')[0] };
        try {
            const expensesColRef = collection(db, 'artifacts', appId, 'users', userId, 'expenses');
            await addDoc(expensesColRef, newExpense);
            setAmount(''); setCategory(''); setDescription('');
        } catch (error) { console.error("Error adding expense:", error); }
    };
    
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Expense Tracker</h2>
            <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end mb-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Select category</option>
                        <option>Food & Dining</option><option>Education</option><option>Transport</option><option>Subscriptions</option><option>Other</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="What did you buy?" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 md:col-start-1">+ Add Expense</button>
            </form>
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Expenses</h3>
                    <p className="font-semibold">Total: ₹{totalExpenses.toLocaleString()}</p>
                </div>
                <ul className="space-y-3">
                   {expenses.map((exp) => (
                       <li key={exp.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                           <div>
                               <p className="font-semibold text-gray-800">{exp.description}</p>
                               <p className="text-sm text-gray-500">{exp.category} • {exp.date}</p>
                           </div>
                           <p className="font-bold text-gray-900">₹{exp.amount.toLocaleString()}</p>
                       </li>
                   ))}
                </ul>
            </div>
        </div>
    );
};

const AIInsightsComponent = ({ userProfile, expenses }) => {
    const [messages, setMessages] = useState([{text: "Hi! Ask me anything about your finances.", sender: 'bot'}]);
    const [userInput, setUserInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages, isTyping]);
    
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;
        const currentInput = userInput;
        setMessages(prev => [...prev, { text: currentInput, sender: 'user' }]);
        setUserInput('');
        setIsTyping(true);

        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const systemPrompt = `You are a friendly financial wellness agent for college student ${userProfile.name}. Their monthly income is ₹${userProfile.income}, and their recent expenses are: ${JSON.stringify(expenses)}. Provide concise, actionable advice based on their questions. Format responses with markdown.`;
        const payload = { contents: [{ parts: [{ text: currentInput }] }], systemInstruction: { parts: [{ text: systemPrompt }] } };

        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            const result = await response.json();
            const botResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
            setMessages(prev => [...prev, { text: botResponse || "Sorry, try again.", sender: 'bot' }]);
        } catch (error) {
            console.error("AI chat error:", error);
            setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting.", sender: 'bot' }]);
        } finally {
            setIsTyping(false);
        }
    };
    
    return (
         <div className="bg-white rounded-lg shadow-sm h-[70vh] flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'bot' && <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"><BotIcon /></div>}
                        <div className={`px-4 py-3 rounded-2xl max-w-lg prose prose-sm ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-lg' : 'bg-gray-100 text-gray-800 rounded-bl-lg'}`}>
                            <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}></p>
                        </div>
                    </div>
                ))}
                {isTyping && (
                     <div className="flex items-start gap-3 justify-start">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"><BotIcon/></div>
                        <div className="px-4 py-3 rounded-2xl bg-gray-100 text-gray-500 rounded-bl-lg">
                           <div className="flex items-center justify-center space-x-1"><span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span><span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span><span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span></div>
                        </div>
                     </div>
                )}
                <div ref={chatEndRef}></div>
            </div>
            <div className="border-t p-4 bg-white rounded-b-lg">
                 <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Ask a financial question..." className="flex-1 w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isTyping} />
                    <button type="submit" className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400" disabled={!userInput.trim() || isTyping}><SendIcon /></button>
                 </form>
            </div>
         </div>
    );
};

const OpportunitiesComponent = () => {
    const opportunities = [
        { type: 'Scholarship', title: 'Merit Scholarship 2024', details: 'Need-based scholarship for engineering students with CGPA above 8.0. Covers full tuition fees.', salary: '₹50,000 per semester', deadline: 'March 15, 2024' },
        { type: 'Part-time Job', title: 'Campus Content Writer', details: 'Write articles for university blog. Flexible hours, work from anywhere on campus.', salary: '₹8,000-12,000/month', deadline: 'February 20, 2024' },
        { type: 'Side Hustle', title: 'Online Tutoring Platform', details: 'Teach mathematics and physics to junior students. Set your own schedule and rates.', salary: '₹300-500/hour', deadline: null },
        { type: 'Part-time Job', title: 'Research Assistant', details: 'Assist professors with data collection and analysis for ongoing research projects.', salary: '₹6,000/month', deadline: 'March 1, 2024' },
    ];
    
    const getTagColor = (type) => {
        switch(type) {
            case 'Scholarship': return 'bg-blue-100 text-blue-800';
            case 'Part-time Job': return 'bg-green-100 text-green-800';
            case 'Side Hustle': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.map((opp, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-gray-800">{opp.title}</h3>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getTagColor(opp.type)}`}>{opp.type}</span>
                    </div>
                    <p className="text-gray-600 mt-2">{opp.details}</p>
                    <div className="mt-4 space-y-2">
                       <p className="text-green-600 font-semibold">{opp.salary}</p>
                       {opp.deadline && <p className="text-sm text-red-500">Deadline: {opp.deadline}</p>}
                    </div>
                    <button className="mt-4 w-full bg-violet-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-violet-600 transition-colors">
                        Learn More <span className="ml-1">→</span>
                    </button>
                </div>
            ))}
        </div>
    );
};