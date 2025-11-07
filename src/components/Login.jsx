import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get the selected role from localStorage
    const role = localStorage.getItem('selectedRole');
    setSelectedRole(role);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let userCredential;
      
      if (isLogin) {
        // Sign in existing user
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Create new user
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }

      const user = userCredential.user;
      let collectionName;
      if (selectedRole === 'student') {
        collectionName = 'students';
      } else if (selectedRole === 'manager') {
        collectionName = 'managers';
      } else {
        collectionName = 'hods';
      }
      const userDocRef = doc(db, collectionName, user.uid);
      
      if (isLogin) {
        // Get existing user data
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          localStorage.setItem(selectedRole, JSON.stringify(userData));
          
          // Navigate based on role
          if (selectedRole === 'student') {
            navigate('/student/dashboard');
          } else if (selectedRole === 'manager') {
            navigate('/manager/dashboard');
          } else {
            navigate('/hod/dashboard');
          }
        } else {
          // Create user record if it doesn't exist during login
          console.log(`Creating ${selectedRole} record for existing user...`);
          const newUserData = {
            email: user.email,
            name: user.displayName || email.split('@')[0],
            role: selectedRole,
            createdAt: new Date().toISOString()
          };

          if (selectedRole === 'student') {
            newUserData.branch = 'Computer Science';
            newUserData.cgpa = '0.0';
            newUserData.year = '2024';
          } else if (selectedRole === 'manager') {
            newUserData.department = 'Placement Office';
            newUserData.experience = '0 years';
          } else {
            newUserData.department = 'Computer Science';
            newUserData.experience = '15 years';
            newUserData.qualification = 'Ph.D. Computer Science';
          }

          await setDoc(userDocRef, newUserData);
          localStorage.setItem(selectedRole, JSON.stringify(newUserData));
          
          // Navigate based on role
          if (selectedRole === 'student') {
            navigate('/student/dashboard');
          } else if (selectedRole === 'manager') {
            navigate('/manager/dashboard');
          } else {
            navigate('/hod/dashboard');
          }
        }
      } else {
        // Create new user document
        const newUserData = {
          email: user.email,
          name: email.split('@')[0], // Use email prefix as default name
          role: selectedRole,
          createdAt: new Date().toISOString()
        };

        if (selectedRole === 'student') {
          newUserData.branch = 'Computer Science';
          newUserData.cgpa = '0.0';
          newUserData.year = '2024';
        } else if (selectedRole === 'manager') {
          newUserData.department = 'Placement Office';
          newUserData.experience = '0 years';
        } else {
          newUserData.department = 'Computer Science';
          newUserData.experience = '15 years';
          newUserData.qualification = 'Ph.D. Computer Science';
        }

        await setDoc(userDocRef, newUserData);
        localStorage.setItem(selectedRole, JSON.stringify(newUserData));
        
        // Navigate based on role
        if (selectedRole === 'student') {
          navigate('/student/dashboard');
        } else if (selectedRole === 'manager') {
          navigate('/manager/dashboard');
        } else {
          navigate('/hod/dashboard');
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>
          {selectedRole === 'student' ? 'Student Login' : 
           selectedRole === 'manager' ? 'Manager Login' : 'HOD Login'}
        </h2>
        <p className="role-indicator">Logging in as: <strong>{selectedRole}</strong></p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <p className="toggle-text">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            className="toggle-btn"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
        
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate('/')}
        >
          ← Back to Role Selection
        </button>
      </div>
    </div>
  );
};

export default Login;
