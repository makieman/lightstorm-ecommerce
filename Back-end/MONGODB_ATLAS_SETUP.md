# MongoDB Atlas Setup Guide for Lightstorm E-commerce

## Step 1: Create MongoDB Atlas Account (Free)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with your email or Google/GitHub account
3. Choose the FREE tier (M0 Sandbox) - it's forever free!

## Step 2: Create a New Cluster
1. Click "Create New Cluster"
2. Select "M0 Sandbox" (FREE tier)
3. Choose a cloud provider (AWS, Google Cloud, or Azure)
4. Select a region closest to you for best performance
5. Click "Create Cluster" (takes 1-3 minutes)

## Step 3: Create Database User
1. In the left sidebar, click "Database Access" under Security
2. Click "Add New Database User"
3. Choose "Password" authentication method
4. Enter a username (e.g., `lightstorm_user`)
5. Enter a strong password
6. Under "Database User Privileges", select "Read and write to any database"
7. Click "Add User"

## Step 4: Allow Network Access
1. In the left sidebar, click "Network Access" under Security
2. Click "Add IP Address"
3. Choose one of these options:
   - **Option A (Recommended for development):** Click "Allow Access from Anywhere" (0.0.0.0/0)
   - **Option B (More secure):** Add your specific IP address
4. Click "Confirm"

## Step 5: Get Your Connection String
1. Go back to "Database" in the left sidebar
2. Click "Connect" button on your cluster
3. Select "Connect your application"
4. Choose "Node.js" as the driver
5. Select version "4.1 or later"
6. Copy the connection string (it looks like this):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
7. Replace `<username>` and `<password>` with your actual credentials
8. Add your database name at the end (e.g., `/lightstorm_ecommerce`)

## Example Connection String Format:
```
mongodb+srv://lightstorm_user:your_password@cluster0.xxxxx.mongodb.net/lightstorm_ecommerce?retryWrites=true&w=majority
```

## Step 6: Update Your .env File
Replace the DATABASE_URL in your `.env` file with your MongoDB Atlas connection string.

## PORT Configuration
PORT=7000

## DATABASE_URL - MongoDB Atlas Connection String
## ⚠️ IMPORTANT: Replace the entire line below with your actual MongoDB Atlas connection string
DATABASE_URL=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/lightstorm_ecommerce?retryWrites=true&w=majority

## GEMINI API KEY (for AI features - keep this secret!)
GEMINI_API_KEY=your_gemini_api_key_here

## Troubleshooting Tips:
1. Make sure you've replaced <username> and <password> with your actual credentials
2. Ensure you've allowed network access (IP whitelist)
3. Check that the database user has proper permissions
4. If connection fails, verify your cluster is running (should show as "Active")
5. Make sure your password doesn't contain special characters like @, #, %, etc. (or URL encode them)

## Testing the Connection:
1. Update your `.env` file with the new DATABASE_URL
2. Restart your backend server: `npm start` or `node src/index.js`
3. Check console - you should see "Connected to MongoDB"
4. Try accessing http://localhost:4200/api/products again

## Important Security Notes:
- Never commit your `.env` file to Git (it's already in .gitignore)
- Keep your MongoDB password secure
- For production, restrict IP access to only your server IP
- Regularly rotate your database credentials
