import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from '@firebase/firestore';
import { auth, db, storage } from '../config';
import { getDownloadURL, ref } from '@firebase/storage';
import { useNavigate } from 'react-router-dom';
import './HomeScreen.css';

const HomeScreen = () => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const currentUser = auth.currentUser;
                const usersCollection = collection(db, 'users');
                const usersSnapshot = await getDocs(usersCollection);

                const usersList = [];
                for (const docSnap of usersSnapshot.docs) {
                    const userData = docSnap.data();
                    if (userData.id !== currentUser.uid) {
                        const pictureUrl = await getUserProfilePicture(docSnap.id);
                        const lastSignInTime = await getUserLastSignInTime(docSnap.id);

                        usersList.push({
                            id: docSnap.id,
                            name: userData.name,
                            email: userData.email,
                            pictureUrl: pictureUrl,
                            lastSignInTime,
                        });
                    }
                }

                setUsers(usersList);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching users: ", error);
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const getUserProfilePicture = async (userId) => {
        try {
            const storageRef = ref(storage, `profile_pictures/${userId}`);
            const url = await getDownloadURL(storageRef);
            return url;
        } catch (error) {
            return null;
        }
    };

    const getUserLastSignInTime = async (userId) => {
        try {
            const userDocRef = doc(db, 'users', userId);
            const userDocSnap = await getDoc(userDocRef);
            const userData = userDocSnap.data();
            if (userData && userData.lastSignInTime) {
                return userData.lastSignInTime.toDate().toLocaleString();
            }
            return 'Недоступно';
        } catch (error) {
            return 'Недоступно';
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleUserClick = (userId) => {
        navigate(`/chat/${userId}`);
    };

    const filteredUsers = users.filter((user) =>
        user.id !== auth.currentUser?.uid && // Exclude the current user
        (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (!auth.currentUser) {
        navigate(`/`);
    }

    return (
        <div className="container_home">
            <div className='header'>
                <h1 className="title">Чаты</h1>
            </div>
            <input
                type="text"
                className="searchInput"
                placeholder="Поиск по имени или электронной почте"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
            />
            {isLoading ? (
                <div className="spinner-container">
                    <div className="spinner"></div>
                </div>
            ) : (
                <ul className="userList">
                    {filteredUsers.length === 0 ? (
                        <p className="emptyText">Пользователи не найдены.</p>
                    ) : (
                        filteredUsers.map((item) => (
                            <li key={item.id} onClick={() => handleUserClick(item.id)} className="userContainer">
                                {item.pictureUrl ? (
                                    <img
                                        src={item.pictureUrl}
                                        alt="Profile"
                                        className="profileImage"
                                    />
                                ) : (
                                    <div className="profileImagePlaceholder" />
                                )}
                                <div className="userInfo">
                                    <p className="userName">{item.name}</p>
                                    <p className="userEmail">{item.email}</p>
                                    <p className="lastSignInTime">{item.lastSignInTime}</p>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};

export default HomeScreen;