
import { useState, useEffect } from 'react';

const generateRandomString = (length: any) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((byte) => possible[byte % possible.length])
    .join('');
};

const generateCodeChallenge = async (verifier: any) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');

  useEffect(() => {
    const exchangeToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code && !accessToken) {
        try {
          setLoading(true);
          setError('');
          const codeVerifier = sessionStorage.getItem('code_verifier');

          if (!codeVerifier) {
            throw new Error('Missing code verifier');
          }
       
          try {           
            const response = await fetch('https://main-sepia-xi.vercel.app/api/v1/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                code,
                code_verifier: codeVerifier
              })
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Token exchange failed');
            }
            const tokenData = await response.json();
            setAccessToken(tokenData);
            setRefreshToken(tokenData || '');

          } catch (err: any) {
            console.error('Full error:', err);
            setError(err.message);
          }
          sessionStorage.removeItem('code_verifier');
        } catch (err: any) {
          setError(err.message || 'Failed to authenticate with Salesforce');
          console.error('Token exchange error:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    exchangeToken();
  }, [accessToken]);

  const initiateLogin = async () => {
    try {
      setLoading(true);
      setError('');

      const codeVerifier = generateRandomString(64);
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      sessionStorage.setItem('code_verifier', codeVerifier);
      const clientId = '3MVG9rZjd7MXFdLhvkStWxMd82zUgk.LAigYgBjk40lK0MRzDwTylLki_6ZR0wGmHCiy15rwby31xTA8B3ojB';
      const redirectUri = encodeURIComponent('https://salesforce-connection.vercel.app');

      const authUrl = `https://login.salesforce.com/services/oauth2/authorize?` +
        `response_type=code` +
        `&client_id=${clientId}` +
        `&redirect_uri=${redirectUri}` +
        `&code_challenge=${codeChallenge}` +
        `&code_challenge_method=S256`;

      window.location.href = authUrl;
    } catch (err) {
      setError('Failed to initiate login');
      console.error('Login initiation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAccessToken('');
    setRefreshToken('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Salesforce OAuth</h1>
        {accessToken ? (
          <div>
            <p style={styles.successMessage}>Authentication Successful!</p>
            <div style={styles.tokenContainer as React.CSSProperties}>
              <strong>Access Token:</strong>
              <div style={styles.tokenValue as React.CSSProperties}>
                {accessToken.substring(0, 30)}...
              </div>
            </div>
            {refreshToken && (
              <div style={styles.tokenContainer}>
                <strong>Refresh Token:</strong>
                <div style={styles.tokenValue as React.CSSProperties}>
                  {refreshToken.substring(0, 30)}...
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              style={styles.logoutButton}
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={initiateLogin}
            disabled={loading}
            style={styles.loginButton}
          >
            {loading ? 'Redirecting to Salesforce...' : 'Login with Salesforce'}
          </button>
        )}

        {error && (
          <p style={styles.errorMessage}>{error}</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5'
  },
  card: {
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
    maxWidth: '500px',
    width: '90%'
  },
  title: {
    marginBottom: '1.5rem',
    color: '#00a1e0'
  },
  successMessage: {
    marginBottom: '1rem',
    color: 'green'
  },
  tokenContainer: {
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    textAlign: 'left' as const
  },
  tokenValue: {
    wordBreak: 'break-all',
    fontSize: '0.8rem',
    marginTop: '0.5rem'
  },
  loginButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#00a1e0',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    width: '100%'
  },
  logoutButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    width: '100%'
  },
  errorMessage: {
    color: 'red',
    marginTop: '1rem',
    backgroundColor: '#ffecec',
    padding: '0.5rem',
    borderRadius: '4px'
  }
};