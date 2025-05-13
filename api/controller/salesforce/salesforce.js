
exports.authtoken = async (req, res) => {
    
    try {
        const { code , code_verifier} = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Authorization code is required' });
        }

        const clientId = process.env.SALESFORCE_CLIENT_ID 
        const clientSecret = process.env.SALESFORCE_CLIENT_SECRET 

        const response = await fetch('https://login.salesforce.com/services/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: 'https://salesforce-connection.vercel.app',
                code_verifier
            })
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('Salesforce error:', data);
            throw new Error(data.error_description || 'Token exchange failed');
        }
        return res.json({ message:'Create Successfully',data })
    } catch (error) {
        console.log(error.massage);
        res.status(500).send("some Error Occured");
    }
};

