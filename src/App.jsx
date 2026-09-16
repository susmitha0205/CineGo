import { useEffect, useState } from "react";
import "./App.css";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

const movies = [
  {
    id: 1,
    title: "Avatar: Fire and Ash",
    genre: "Action • Adventure • Fantasy",
    rating: "8.8",
    year: "2026",
    language: "English",
    duration: "2h 45m",
    image: "/posters/avatar.jpg",
    description:
      "The world of Pandora returns with a new chapter filled with breathtaking visuals, powerful emotions and an epic adventure."
  },
  {
    id: 2,
    title: "F1",
    genre: "Action • Drama • Sport",
    rating: "8.5",
    year: "2025",
    language: "English",
    duration: "2h 35m",
    image: "/posters/f1.jpg",
    description:
      "A former racing star returns to Formula 1 to mentor a young driver while chasing one final shot at glory."
  },
  {
    id: 3,
    title: "Superman",
    genre: "Action • Sci-Fi • Adventure",
    rating: "8.4",
    year: "2025",
    language: "English",
    duration: "2h 9m",
    image: "/posters/superman.jpg",
    description:
      "A new era of Superman begins as the Man of Steel finds his place between his Kryptonian heritage and humanity."
  },
  {
    id: 4,
    title: "Fantastic Four",
    genre: "Action • Sci-Fi",
    rating: "8.2",
    year: "2025",
    language: "English",
    duration: "1h 55m",
    image: "/posters/fantastic-four.jpg",
    description:
      "Four extraordinary heroes discover that their greatest challenge may be protecting the world while learning to work together."
  },
  {
    id: 5,
    title: "Kantara",
    genre: "Action • Drama • Thriller",
    rating: "9.0",
    year: "2022",
    language: "Kannada",
    duration: "2h 28m",
    image: "/posters/kantara.jpg",
    description:
      "A powerful story rooted in tradition, faith, land and the mysterious connection between humans and nature."
  },
  {
    id: 6,
    title: "KGF Chapter 2",
    genre: "Action • Crime • Drama",
    rating: "8.9",
    year: "2022",
    language: "Kannada",
    duration: "2h 48m",
    image: "/posters/kgf-2.jpg",
    description:
      "Rocky rises to power and faces powerful enemies who are determined to bring his empire down."
  }
];

const cinemas = [
  { id: 1, name: "PVR INOX", location: "Orion Mall, Rajajinagar" },
  { id: 2, name: "Cinepolis", location: "Forum Mall, Koramangala" },
  { id: 3, name: "INOX", location: "Garuda Mall, Magrath Road" }
];

const dates = [
  { id: 1, day: "TODAY", date: "10 SEP" },
  { id: 2, day: "FRI", date: "11 SEP" },
  { id: 3, day: "SAT", date: "12 SEP" },
  { id: 4, day: "SUN", date: "13 SEP" },
  { id: 5, day: "MON", date: "14 SEP" }
];

const showtimes = [
  "10:30 AM",
  "1:45 PM",
  "4:30 PM",
  "7:45 PM",
  "10:30 PM"
];

const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];

const prices = {
  A: 180,
  B: 180,
  C: 220,
  D: 220,
  E: 250,
  F: 250,
  G: 280,
  H: 280
};

function App() {
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [bookingMovie, setBookingMovie] = useState(null);

  const [selectedCinema, setSelectedCinema] = useState(cinemas[0]);
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedTime, setSelectedTime] = useState(showtimes[3]);

  const [selectedSeats, setSelectedSeats] = useState([]);

  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentPage, setPaymentPage] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const [loginPage, setLoginPage] = useState(false);
  const [signupMode, setSignupMode] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
const [authEmail, setAuthEmail] = useState("");
const [authPassword, setAuthPassword] = useState("");

  const [userName, setUserName] = useState("");
  const [profilePage, setProfilePage] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
        setUserName(user.displayName || user.email || "CineGo User");
      } else {
        setLoggedIn(false);
        setUserName("");
      }
    });

    return unsubscribe;
  }, []);
  
  const [bookings, setBookings] = useState(() => {
    const savedBookings = localStorage.getItem("cinego_bookings");
    return savedBookings ? JSON.parse(savedBookings) : [];
  });
  const [watchlist, setWatchlist] = useState(() => {
  const savedWatchlist = localStorage.getItem("cinego_watchlist");
  return savedWatchlist ? JSON.parse(savedWatchlist) : [];
});
  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(search.toLowerCase())
  );

  const startBooking = (movie) => {
    setBookingMovie(movie);
    setSelectedSeats([]);
    setPaymentPage(false);
    setBookingConfirmed(false);
    setProfilePage(false);
  };
  const toggleWatchlist = (movie) => {
  setWatchlist((prev) => {
    const alreadySaved = prev.some((item) => item.id === movie.id);

    const updatedWatchlist = alreadySaved
      ? prev.filter((item) => item.id !== movie.id)
      : [...prev, movie];

    localStorage.setItem(
      "cinego_watchlist",
      JSON.stringify(updatedWatchlist)
    );

    return updatedWatchlist;
  });
};

  const toggleSeat = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatId));
      return;
    }

    if (selectedSeats.length >= 8) {
      alert("Maximum 8 seats allowed.");
      return;
    }

    setSelectedSeats([...selectedSeats, seatId]);
  };

  const totalAmount = selectedSeats.reduce((total, seat) => {
    return total + prices[seat.charAt(0)];
  }, 0);

  const convenienceFee = selectedSeats.length * 25;
  const gst = Math.round((totalAmount + convenienceFee) * 0.18);
  const grandTotal = totalAmount + convenienceFee + gst;

  const goToSeats = () => {
    setBookingMovie({
      ...bookingMovie,
      seatSelection: true
    });
  };

  const backFromSeats = () => {
    setBookingMovie({
      ...bookingMovie,
      seatSelection: false
    });
  };

  const goToPayment = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }

    setPaymentPage(true);
  };

  const backFromPayment = () => {
    setPaymentPage(false);
  };

  const makePayment = () => {
    const newBooking = {
      id: `CG${Date.now().toString().slice(-6)}`,
      movie: bookingMovie,
      cinema: selectedCinema,
      date: selectedDate,
      time: selectedTime,
      seats: [...selectedSeats],
      amount: grandTotal
    };

    const updatedBookings = [newBooking, ...bookings];
setBookings(updatedBookings);
localStorage.setItem("cinego_bookings", JSON.stringify(updatedBookings));
    setBookingConfirmed(true);
  };

  const resetBooking = () => {
    setBookingMovie(null);
    setSelectedMovie(null);
    setSelectedSeats([]);
    setPaymentPage(false);
    setBookingConfirmed(false);
  };

  
    
const handleLogin = async (e) => {
  e.preventDefault();

  if (!authEmail || !authPassword) {
    alert("Please enter email and password.");
    return;
  }

  try {
    if (signupMode) {
      if (!userName.trim()) {
        alert("Please enter your name.");
        return;
      }

      const result = await createUserWithEmailAndPassword(
        auth,
        authEmail,
        authPassword
      );

      await updateProfile(result.user, {
        displayName: userName,
      });

      setUserName(userName);
      setLoggedIn(true);
      setLoginPage(false);
    } else {
      const result = await signInWithEmailAndPassword(
        auth,
        authEmail,
        authPassword
      );

      setUserName(result.user.displayName || result.user.email);
      setLoggedIn(true);
      setLoginPage(false);
    }
  } catch (error) {
    alert(error.message);
  }
};

  const openLogin = () => {
    setLoginPage(true);
    setSignupMode(false);
    setProfilePage(false);
  };

  const openProfile = () => {
    setProfilePage(true);
    setLoginPage(false);
    setSelectedMovie(null);
    setBookingMovie(null);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setProfilePage(false);
    } catch (error) {
      alert(error.message);
    }
  };
 

  return (
    <div className="app">
      {/* NAVBAR */}
      <nav className="navbar">
        <button
          className="logo logo-button"
          onClick={() => {
            setProfilePage(false);
            setLoginPage(false);
            setSelectedMovie(null);
            setBookingMovie(null);
          }}
        >
          Cine<span>Go</span>
        </button>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#movies">Movies</a>
          <a href="#cinemas">Cinemas</a>
          <a href="#offers">Offers</a>
        </div>

        <div className="nav-right">
          <span className="location">📍 Bengaluru</span>

          <button
            className="search-icon"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
          >
            ⌕
          </button>

          {loggedIn ? (
            <button className="profile-button" onClick={openProfile}>
              <span className="profile-avatar">
                {userName.charAt(0).toUpperCase()}
              </span>
              {userName}
            </button>
          ) : (
            <button className="signin" onClick={openLogin}>
              Sign in
            </button>
          )}
        </div>
      </nav>

      {/* SEARCH OVERLAY */}
      {searchOpen && (
        <div
          className="cinego-search-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSearchOpen(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(8, 8, 12, 0.94)",
            backdropFilter: "blur(18px)",
            padding: "90px 6vw 40px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: "28px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: "16px",
                  padding: "0 20px",
                }}
              >
                <span style={{ fontSize: "25px" }}>⌕</span>
                <input
                  autoFocus
                  type="text"
                  placeholder="Search movies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: "100%",
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    color: "#fff",
                    fontSize: "20px",
                    padding: "20px 0",
                  }}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#aaa",
                      fontSize: "22px",
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                onClick={() => setSearchOpen(false)}
                style={{
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  borderRadius: "14px",
                  width: "52px",
                  height: "52px",
                  fontSize: "25px",
                  cursor: "pointer",
                }}
                aria-label="Close search"
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: "22px" }}>
              <span
                style={{
                  color: "#aaa",
                  fontSize: "13px",
                  letterSpacing: "1.5px",
                }}
              >
                {search
                  ? `${filteredMovies.length} movie${
                      filteredMovies.length !== 1 ? "s" : ""
                    } found`
                  : "TRENDING MOVIES"}
              </span>
            </div>

            {filteredMovies.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(170px, 1fr))",
                  gap: "22px",
                }}
              >
                {filteredMovies.map((movie) => (
                  <article
                    key={movie.id}
                    onClick={() => {
                      setSelectedMovie(movie);
                      setSearchOpen(false);
                    }}
                    style={{
                      cursor: "pointer",
                      borderRadius: "16px",
                      overflow: "hidden",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <img
                      src={movie.image}
                      alt={movie.title}
                      style={{
                        width: "100%",
                        aspectRatio: "2 / 3",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <div style={{ padding: "13px" }}>
                      <h3
                        style={{
                          margin: "0 0 6px",
                          color: "#fff",
                          fontSize: "16px",
                        }}
                      >
                        {movie.title}
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          color: "#aaa",
                          fontSize: "13px",
                        }}
                      >
                        ⭐ {movie.rating} • {movie.language}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "80px 20px",
                  color: "#aaa",
                }}
              >
                <div style={{ fontSize: "55px", marginBottom: "15px" }}>⌕</div>
                <h2 style={{ color: "#fff", marginBottom: "8px" }}>
                  No movies found
                </h2>
                <p>Try another movie name.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROFILE PAGE */}
      {profilePage && loggedIn ? (
        <main className="profile-page">
          <button
            className="back-button"
            onClick={() => setProfilePage(false)}
          >
            ← Back to CineGo
          </button>

          <div className="profile-hero">
            <div className="profile-user">
              <div className="profile-big-avatar">
                {userName.charAt(0).toUpperCase()}
              </div>

              <div>
                <span className="eyebrow">CINEGO MEMBER</span>
                <h1>{userName}</h1>
                <p>Movie lover • Bengaluru</p>
              </div>
            </div>

            <button className="logout-button" onClick={logout}>
              Log out
            </button>
          </div>

          <div className="profile-stats">
            <div>
              <strong>{bookings.length}</strong>
              <span>Total bookings</span>
            </div>

            <div>
              <strong>{watchlist.length}</strong>
              <span>Watchlist</span>
            </div>

            <div>
              <strong>⭐</strong>
              <span>CineGo member</span>
            </div>
          </div>
{/* profile stats end */}

{/* MY WATCHLIST */}
<section className="profile-section">
  <div className="profile-section-heading">
    <div>
      <span className="eyebrow">YOUR COLLECTION</span>
      <h2>My Watchlist</h2>
    </div>

    <span className="booking-count">
      {watchlist.length} movies
    </span>
  </div>

  {watchlist.length === 0 ? (
    <div className="empty-bookings">
      <div className="empty-icon">♡</div>
      <h3>Your watchlist is empty</h3>
      <p>Save movies you want to watch later.</p>
    </div>
  ) : (
    <div className="watchlist-grid">
      {watchlist.map((movie) => (
        <div className="watchlist-card" key={movie.id}>
          <img src={movie.image} alt={movie.title} />

          <div className="watchlist-info">
            <h3>{movie.title}</h3>
            <p>⭐ {movie.rating} • {movie.language}</p>

            <button
              className="secondary-button"
              onClick={() => toggleWatchlist(movie)}
            >
              ♥ Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</section>
{/* YOUR EXISTING MY BOOKINGS */}
<section className="profile-section">

            <div className="profile-section-heading">
              <div>
                <span className="eyebrow">YOUR MOVIES</span>
                <h2>My bookings</h2>
              </div>

              <span className="booking-count">
                {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
              </span>
            </div>

            {bookings.length === 0 ? (
              <div className="empty-bookings">
                <div className="empty-icon">🎟️</div>

                <h3>No bookings yet</h3>

                <p>
                  Your booked movie tickets will appear here.
                </p>

                <button
                  className="primary-button"
                  onClick={() => setProfilePage(false)}
                >
                  Explore movies
                </button>
              </div>
            ) : (
              <div className="booking-history">
                {bookings.map((booking) => (
                  <div className="history-card" key={booking.id}>
                    <img
                      src={booking.movie.image}
                      alt={booking.movie.title}
                    />

                    <div className="history-info">
                      <span className="history-status">CONFIRMED</span>

                      <h3>{booking.movie.title}</h3>

                      <p>
                        {booking.cinema.name} •{" "}
                        {booking.cinema.location}
                      </p>

                      <div className="history-meta">
                        <span>
                          📅 {booking.date.date}
                        </span>

                        <span>
                          🕒 {booking.time}
                        </span>

                        <span>
                          💺 {booking.seats.join(", ")}
                        </span>
                      </div>
                    </div>

                    <div className="history-right">
                      <strong>₹{booking.amount}</strong>
                      <small>{booking.id}</small>
                      <button

                        onClick={() => {

                          setBookingMovie(booking.movie);

                          setSelectedCinema(booking.cinema);

                          setSelectedDate(booking.date);

                          setSelectedTime(booking.time);

                          setSelectedSeats(booking.seats);

                          setBookingConfirmed(true);

                          setProfilePage(false);

                        }}

                      >

                        View ticket →

                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      ) : loginPage ? (
        /* LOGIN / SIGN UP */
        <main className="auth-page">
          <div className="auth-visual">
            <div className="auth-visual-content">
              <span className="eyebrow">WELCOME TO CINEGO</span>

              <h1>
                Your next
                <br />
                <span>movie night.</span>
              </h1>

              <p>
                Sign in to manage your bookings, save movies and get
                personalised offers.
              </p>

              <div className="auth-perks">
                <div>
                  <span>✓</span>
                  <p>Instant ticket booking</p>
                </div>

                <div>
                  <span>✓</span>
                  <p>Save your favourite movies</p>
                </div>

                <div>
                  <span>✓</span>
                  <p>Exclusive member offers</p>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-card-wrapper">
            <button
              className="auth-close"
              onClick={() => setLoginPage(false)}
            >
              ×
            </button>

            <div className="auth-card">
              <div className="auth-logo">
                Cine<span>Go</span>
              </div>

              <span className="eyebrow">
                {signupMode ? "CREATE ACCOUNT" : "WELCOME BACK"}
              </span>

              <h2>
                {signupMode
                  ? "Join CineGo"
                  : "Sign in to continue"}
              </h2>

              <p className="auth-subtitle">
                {signupMode
                  ? "Create your account and start your movie journey."
                  : "Your movies are waiting for you."}
              </p>

              <form onSubmit={handleLogin}>
                {signupMode && (
                  <>
                    <label>Full name</label>

                    <input
                      className="auth-input"
                      type="text"
                      placeholder="Enter your name"
                      value={userName}
                      onChange={(e) =>
                        setUserName(e.target.value)
                      }
                    />
                  </>
                )}

                <label>Mobile number</label>

                <div className="phone-input">
                  <span>+91</span>

                  <input
                    type="tel"
                    placeholder="Enter mobile number"
                    maxLength="10"
                  />
                </div>

                <label>Email address</label>

                <input
                    className="auth-input"
                    type="email"
                    placeholder="you@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    autoComplete="email"
                  />

                  <label>Password</label>

                  <input
                    className="auth-input"
                    type="password"
                    placeholder="Enter your password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    autoComplete={signupMode ? "new-password" : "current-password"}
                  />

                <button className="auth-submit" type="submit">
                  {signupMode
                    ? "Create account"
                    : "Continue"}

                  <span>→</span>
                </button>
              </form>

              <div className="auth-divider">
                <span>OR</span>
              </div>

              <button
                className="google-button"
                onClick={() =>
                  alert("Google sign-in is not enabled yet. Please use Email/Password.")
                }
              >
                <strong>G</strong>
                Continue with Google
              </button>

              <p className="auth-switch">
                {signupMode
                  ? "Already have an account?"
                  : "New to CineGo?"}

                <button
                  onClick={() =>
                    setSignupMode(!signupMode)
                  }
                >
                  {signupMode
                    ? " Sign in"
                    : " Create account"}
                </button>
              </p>
            </div>
          </div>
        </main>
      ) : paymentPage && bookingMovie && !bookingConfirmed ? (
        /* PAYMENT PAGE */
        <main className="payment-page">
          <button className="back-button" onClick={backFromPayment}>
            ← Back to seats
          </button>

          <div className="payment-header">
            <div>
              <span className="eyebrow">SECURE CHECKOUT</span>
              <h1>Complete your booking</h1>
              <p>Almost there. Choose your payment method and confirm.</p>
            </div>

            <div className="secure-badge">🔒 Secure Payment</div>
          </div>

          <div className="payment-layout">
            <section className="payment-main">
              <div className="payment-card">
                <div className="payment-card-title">
                  <div>
                    <span className="step-number">01</span>
                    <h3>Payment method</h3>
                  </div>
                </div>

                <div className="payment-methods">
                  {["UPI", "Card", "Net Banking"].map((method) => (
                    <button
                      key={method}
                      className={`payment-method ${
                        paymentMethod === method ? "active" : ""
                      }`}
                      onClick={() => setPaymentMethod(method)}
                    >
                      <span className="payment-method-icon">
                        {method === "UPI"
                          ? "◉"
                          : method === "Card"
                          ? "▣"
                          : "⌁"}
                      </span>

                      <span>
                        <strong>{method}</strong>

                        <small>
                          {method === "UPI"
                            ? "Google Pay • PhonePe • Paytm"
                            : method === "Card"
                            ? "Credit / Debit Card"
                            : "All major banks"}
                        </small>
                      </span>

                      <span className="method-check">
                        {paymentMethod === method
                          ? "✓"
                          : ""}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="payment-form">
                  {paymentMethod === "UPI" && (
                    <>
                      <label>UPI ID</label>

                      <div className="input-wrap">
                        <input placeholder="yourname@upi" />
                        <span>✓</span>
                      </div>
                    </>
                  )}

                  {paymentMethod === "Card" && (
                    <>
                      <label>Card number</label>

                      <input
                        className="payment-input"
                        placeholder="1234 5678 9012 3456"
                      />

                      <div className="form-row">
                        <div>
                          <label>Expiry</label>

                          <input
                            className="payment-input"
                            placeholder="MM / YY"
                          />
                        </div>

                        <div>
                          <label>CVV</label>

                          <input
                            className="payment-input"
                            placeholder="•••"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {paymentMethod === "Net Banking" && (
                    <>
                      <label>Select your bank</label>

                      <select className="payment-input">
                        <option>State Bank of India</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                      </select>
                    </>
                  )}
                </div>
              </div>

              <div className="payment-security">
                <span>🛡️</span>

                <div>
                  <strong>Your payment is secure</strong>

                  <p>
                    CineGo uses secure payment processing. This is a
                    demo checkout and no real payment will be charged.
                  </p>
                </div>
              </div>
            </section>

            <aside className="order-summary">
              <div className="summary-poster">
                <img
                  src={bookingMovie.image}
                  alt={bookingMovie.title}
                />

                <div>
                  <h3>{bookingMovie.title}</h3>
                  <span>{bookingMovie.language}</span>
                </div>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-details">
                <div>
                  <span>Cinema</span>
                  <strong>{selectedCinema.name}</strong>
                  <small>{selectedCinema.location}</small>
                </div>

                <div className="summary-line">
                  <span>Date</span>

                  <strong>
                    {selectedDate.day} • {selectedDate.date}
                  </strong>
                </div>

                <div className="summary-line">
                  <span>Showtime</span>
                  <strong>{selectedTime}</strong>
                </div>

                <div className="summary-line">
                  <span>Seats</span>
                  <strong>{selectedSeats.join(", ")}</strong>
                </div>
              </div>

              <div className="summary-divider"></div>

              <div className="price-breakdown">
                <div>
                  <span>Tickets</span>
                  <span>₹{totalAmount}</span>
                </div>

                <div>
                  <span>Convenience fee</span>
                  <span>₹{convenienceFee}</span>
                </div>

                <div>
                  <span>GST</span>
                  <span>₹{gst}</span>
                </div>

                <div className="grand-total">
                  <span>Total</span>
                  <strong>₹{grandTotal}</strong>
                </div>
              </div>

              <button className="pay-button" onClick={makePayment}>
                Pay ₹{grandTotal}
                <span>→</span>
              </button>
            </aside>
          </div>
        </main>
      ) : bookingConfirmed && bookingMovie ? (
        /* CONFIRMATION */
        <main className="confirmation-page">
          <div className="success-icon">✓</div>

          <span className="eyebrow">BOOKING CONFIRMED</span>

          <h1>Your tickets are ready!</h1>

          <p className="confirmation-text">
            Your CineGo booking has been successfully confirmed.
          </p>

          <div className="ticket-card">
            <div className="ticket-top">
              <div>
                <span className="ticket-label">MOVIE</span>

                <h2>{bookingMovie.title}</h2>

                <p>{bookingMovie.language}</p>
              </div>

              <div className="ticket-status">CONFIRMED</div>
            </div>

            <div className="ticket-info-grid">
              <div>
                <span>DATE</span>
                <strong>{selectedDate.date}</strong>
              </div>

              <div>
                <span>TIME</span>
                <strong>{selectedTime}</strong>
              </div>

              <div>
                <span>SEATS</span>
                <strong>{selectedSeats.join(", ")}</strong>
              </div>

              <div>
                <span>AMOUNT</span>
                <strong>₹{grandTotal}</strong>
              </div>
            </div>

            <div className="ticket-location">
              <div>
                <span>CINEMA</span>

                <strong>{selectedCinema.name}</strong>

                <small>{selectedCinema.location}</small>
              </div>

              <div className="fake-qr">
                <div>▦</div>
                <small>CG-{bookingMovie.id}82</small>
              </div>
            </div>

            <div className="ticket-footer">
              <span>
                Booking ID: CG2026{bookingMovie.id}8241
              </span>

              <span>Show this ticket at the entrance</span>
            </div>
          </div>

          <button className="home-button" onClick={resetBooking}>
            Back to CineGo
          </button>
        </main>
      ) : bookingMovie && bookingMovie.seatSelection ? (
        /* SEATS */
        <main className="seat-page">
          <button className="back-button" onClick={backFromSeats}>
            ← Back to showtimes
          </button>

          <div className="seat-heading">
            <div>
              <span className="eyebrow">STEP 2 OF 3</span>

              <h1>Select your seats</h1>

              <p>
                {bookingMovie.title} • {selectedCinema.name} •{" "}
                {selectedTime}
              </p>
            </div>

            <div className="seat-count">
              {selectedSeats.length} / 8 selected
            </div>
          </div>

          <div className="seat-layout">
            <div className="screen-area">
              <div className="screen"></div>
              <span>SCREEN THIS WAY</span>
            </div>

            <div className="seat-grid">
              {rows.map((row) => (
                <div className="seat-row" key={row}>
                  <span className="row-label">{row}</span>

                  <div className="seat-group">
                    {[1, 2, 3, 4, 5].map((number) => {
                      const seatId = `${row}${number}`;

                      return (
                        <button
                          key={seatId}
                          className={`seat ${
                            selectedSeats.includes(seatId)
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => toggleSeat(seatId)}
                        >
                          {number}
                        </button>
                      );
                    })}
                  </div>

                  <div className="seat-gap"></div>

                  <div className="seat-group">
                    {[6, 7, 8, 9, 10].map((number) => {
                      const seatId = `${row}${number}`;

                      return (
                        <button
                          key={seatId}
                          className={`seat ${
                            selectedSeats.includes(seatId)
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => toggleSeat(seatId)}
                        >
                          {number}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="seat-legend">
              <span>
                <i className="legend-seat"></i> Available
              </span>

              <span>
                <i className="legend-seat selected"></i> Selected
              </span>

              <span>
                <i className="legend-seat occupied"></i> Occupied
              </span>
            </div>

            <div className="seat-summary">
              <div className="summary-info">
                <span>Selected seats</span>

                <strong>
                  {selectedSeats.length
                    ? selectedSeats.join(", ")
                    : "No seats selected"}
                </strong>
              </div>

              <div className="summary-price">
                <span>Total</span>
                <strong>₹{totalAmount}</strong>
              </div>

              <button
                className="continue-button"
                disabled={selectedSeats.length === 0}
                onClick={goToPayment}
              >
                Continue to payment →
              </button>
            </div>
          </div>
        </main>
      ) : bookingMovie ? (
        /* BOOKING */
        <main className="booking-page">
          <button
            className="back-button"
            onClick={() => setBookingMovie(null)}
          >
            ← Back to movie
          </button>

          <div className="booking-heading">
            <div>
              <span className="eyebrow">STEP 1 OF 3</span>

              <h1>Book your tickets</h1>

              <p>Choose your cinema, date and showtime.</p>
            </div>
          </div>

          <div className="booking-movie-mini">
            <img
              className="mini-poster"
              src={bookingMovie.image}
              alt={bookingMovie.title}
            />

            <div>
              <span className="mini-label">NOW BOOKING</span>

              <h2>{bookingMovie.title}</h2>

              <p>
                {bookingMovie.language} • {bookingMovie.duration} •{" "}
                {bookingMovie.genre}
              </p>
            </div>
          </div>

          <section className="booking-section">
            <div className="section-title">
              <span className="step-number">01</span>

              <div>
                <h3>Select cinema</h3>
                <p>Pick a cinema near you</p>
              </div>
            </div>

            <div className="cinema-grid">
              {cinemas.map((cinema) => (
                <button
                  key={cinema.id}
                  className={`cinema-card ${
                    selectedCinema.id === cinema.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() => setSelectedCinema(cinema)}
                >
                  <span className="cinema-icon">▣</span>

                  <span className="cinema-info">
                    <strong>{cinema.name}</strong>
                    <small>{cinema.location}</small>
                  </span>

                  <span className="check">
                    {selectedCinema.id === cinema.id
                      ? "✓"
                      : ""}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="booking-section">
            <div className="section-title">
              <span className="step-number">02</span>

              <div>
                <h3>Select date</h3>
                <p>Choose your preferred date</p>
              </div>
            </div>

            <div className="date-grid">
              {dates.map((date) => (
                <button
                  key={date.id}
                  className={`date-card ${
                    selectedDate.id === date.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() => setSelectedDate(date)}
                >
                  <span>{date.day}</span>
                  <strong>{date.date}</strong>
                </button>
              ))}
            </div>
          </section>

          <section className="booking-section">
            <div className="section-title">
              <span className="step-number">03</span>

              <div>
                <h3>Select showtime</h3>
                <p>Choose your preferred show</p>
              </div>
            </div>

            <div className="showtime-grid">
              {showtimes.map((time) => (
                <button
                  key={time}
                  className={`showtime ${
                    selectedTime === time ? "active" : ""
                  }`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </section>

          <div className="booking-bottom">
            <div className="booking-notice">
              <span>🎟️</span>

              <div>
                <strong>Almost there!</strong>

                <p>
                  Next, you'll choose your seats and complete payment.
                </p>
              </div>
            </div>

            <button className="continue-button" onClick={goToSeats}>
              Continue to seats →
            </button>
          </div>
        </main>
      ) : selectedMovie ? (
        /* DETAILS */
        <main className="details-page">
          <button
            className="back-button"
            onClick={() => setSelectedMovie(null)}
          >
            ← Back to movies
          </button>

          <div className="details-layout">
            <img
              className="details-poster"
              src={selectedMovie.image}
              alt={selectedMovie.title}
            />

            <div className="details-content">
              <span className="eyebrow">CINEGO EXCLUSIVE</span>

              <h1>{selectedMovie.title}</h1>

              <div className="details-meta">
                <span>⭐ {selectedMovie.rating}</span>
                <span>{selectedMovie.year}</span>
                <span>{selectedMovie.language}</span>
                <span>{selectedMovie.duration}</span>
              </div>

              <p className="details-genre">
                {selectedMovie.genre}
              </p>

              <p className="details-description">
                {selectedMovie.description}
              </p>

              <div className="details-actions">
                <button
                  className="primary-button"
                  onClick={() =>
                    startBooking(selectedMovie)
                  }
                >
                  Book Tickets
                </button>

                <button className="secondary-button">
                  ▶ Trailer
                </button>

               <button
  className="secondary-button"
  onClick={() => toggleWatchlist(selectedMovie)}
>
  {watchlist.some((item) => item.id === selectedMovie.id)
    ? "♥ Saved"
    : "♡ Watchlist"}
</button>
              </div>
            </div>
          </div>
        </main>
      ) : (
        /* HOME */
        <>
          <section className="hero" id="home">
            <div className="hero-content">
              <span className="eyebrow">WELCOME TO CINEGO</span>

              <h1>
                Movies that
                <br />
                <span>move you.</span>
              </h1>

              <p>
                Discover the latest blockbusters, find your perfect
                showtime, and book your seats in seconds.
              </p>

              <div className="hero-search">
                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search movies..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

                <button onClick={() => setSearchOpen(true)}>Search</button>
              </div>

              <div className="hero-stats">
                <div>
                  <strong>500+</strong>
                  <span>Movies</span>
                </div>

                <div>
                  <strong>120+</strong>
                  <span>Cinemas</span>
                </div>

                <div>
                  <strong>1M+</strong>
                  <span>Happy viewers</span>
                </div>
              </div>
            </div>

            <div className="hero-glow"></div>
          </section>

          <section className="movies-section" id="movies">
            <div className="section-header">
              <div>
                <span className="eyebrow">WHAT'S PLAYING</span>
                <h2>Trending movies</h2>
              </div>

              <button className="view-all">
                View all →
              </button>
            </div>

            <div className="movie-grid">
              {filteredMovies.length === 0 ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    padding: "50px 20px",
                    textAlign: "center",
                  }}
                >
                  <h3>No movies found</h3>
                  <p>Try searching for another movie.</p>
                </div>
              ) : (
                filteredMovies.map((movie) => (
                <article
                  className="movie-card"
                  key={movie.id}
                  onClick={() =>
                    setSelectedMovie(movie)
                  }
                >
                  <div className="poster-wrapper">
                    <img
                      src={movie.image}
                      alt={movie.title}
                    />

                    <div className="poster-overlay">
                      <span>⭐ {movie.rating}</span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMovie(movie);
                        }}
                      >
                        View details
                      </button>
                    </div>
                  </div>

                  <div className="movie-info">
                    <h3>{movie.title}</h3>

                    <p>
                      {movie.language} •{" "}
                      {movie.genre.split(" • ")[0]}
                    </p>
                  </div>
                </article>
                ))
              )}
            </div>
          </section>

          <section className="cinema-banner" id="cinemas">
            <div>
              <span className="eyebrow">
                FIND YOUR CINEMA
              </span>

              <h2>
                Your movie night,
                <br />
                <span>your way.</span>
              </h2>

              <p>
                From luxury recliners to IMAX screens,
                discover cinemas made for unforgettable
                experiences.
              </p>

              <button>
                Explore cinemas →
              </button>
            </div>
          </section>

          <section className="offers-section" id="offers">
            <div className="section-header">
              <div>
                <span className="eyebrow">
                  CINEGO OFFERS
                </span>

                <h2>More movies. More savings.</h2>
              </div>
            </div>

            <div className="offers-grid">
              <div className="offer-card">
                <span>🎟️</span>
                <h3>First booking?</h3>
                <p>
                  Get ₹150 OFF on your first CineGo booking.
                </p>
              </div>

              <div className="offer-card">
                <span>🍿</span>
                <h3>Movie + munchies</h3>
                <p>
                  Unlock exclusive combos at selected cinemas.
                </p>
              </div>

              <div className="offer-card">
                <span>💳</span>
                <h3>Bank offers</h3>
                <p>
                  Save more with selected cards and UPI offers.
                </p>
              </div>
            </div>
          </section>

          <footer className="footer">
            <div className="logo">
              Cine<span>Go</span>
            </div>

            <p>Made for people who love movies.</p>

            <span>© 2026 CineGo</span>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;
