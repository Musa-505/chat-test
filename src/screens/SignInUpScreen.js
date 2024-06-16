import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth, storage } from '../config';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from '@firebase/auth';
import { getDownloadURL, ref, uploadBytes } from '@firebase/storage';
import { doc, setDoc, getDoc, updateDoc } from '@firebase/firestore';
import './SignInUpScreen.css';

const SignInUpScreen = () => {
    const [isSigningUp, setIsSigningUp] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const checkIfSignedIn = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const userData = await getUserData(user.uid);
                    if (userData) {
                        navigate('/home');
                    }
                }
            } catch (error) {
                console.error('Ошибка при проверке вошедшего пользователя: ', error);
            }
        };

        checkIfSignedIn();
    }, []);

    const handleImagePick = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImage(file);
        }
    };

    const handleSignUp = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            let pictureUrl = '';
            if (image) {
                const storageRef = ref(storage, `profile_pictures/${user.uid}`);
                await uploadBytes(storageRef, image);
                pictureUrl = await getDownloadURL(storageRef);
            }

            const userData = {
                name,
                email,
                pictureUrl,
                lastSignInTime: new Date(),
            };

            await setDoc(doc(db, 'users', user.uid), userData);

            localStorage.setItem('userData', JSON.stringify(userData));
            navigate('/home');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleSignIn = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            if (user) {
                const userRef = doc(db, 'users', user.uid);

                await updateDoc(userRef, {
                    lastSignInTime: new Date(),
                });

                const userData = await getUserData(user.uid);

                navigate('/home');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const getUserData = async (uid) => {
        try {
            const userDocRef = doc(db, 'users', uid);
            const docSnapshot = await getDoc(userDocRef);
            if (docSnapshot.exists()) {
                return { uid, ...docSnapshot.data() };
            }
            return null;
        } catch (error) {
            console.error('Ошибка при получении данных пользователя: ', error);
            return null;
        }
    };

    return (
        <div className="container_signin">
            <div className="form-container">
                {isSigningUp && (
                    <input
                        type="text"
                        placeholder="Имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input"
                    />
                )}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                />
                {isSigningUp && (
                    <>
                        <input type="file" onChange={handleImagePick} className="image-picker" />
                        {image && <img src={URL.createObjectURL(image)} alt="Профиль" className="profile-image" />}
                    </>
                )}
                <button onClick={isSigningUp ? handleSignUp : handleSignIn} className="button">
                    {isSigningUp ? 'Зарегистрироваться' : 'Войти'}
                </button>
                {error && <p className="error-text">{error}</p>}
                <button onClick={() => setIsSigningUp(!isSigningUp)} className="switch-button">
                    {isSigningUp ? 'Переключиться на Вход' : 'Переключиться на Регистрацию'}
                </button>
            </div>
        </div>
    );
};

export default SignInUpScreen;