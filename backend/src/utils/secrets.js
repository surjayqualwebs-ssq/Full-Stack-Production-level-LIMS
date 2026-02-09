import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "ap-south-1" }); // Change region if needed

export const getSecret = async (secretName) => {
    try {
        const response = await client.send(
            new GetSecretValueCommand({
                SecretId: secretName,
                VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
            })
        );

        if (response.SecretString) {
            return JSON.parse(response.SecretString);
        }
        return null;
    } catch (error) {
        console.error(`Error retrieving secret ${secretName}:`, error);
        // Fallback for development if not on AWS/no creds, 
        // strictly for Day 24 we might want to just fail or use env vars as backup?
        // Prompt says: "Fetch secrets in app startup"
        // Let's assume on error we return null and let app fail or fallback to process.env
        return null;
    }
};
