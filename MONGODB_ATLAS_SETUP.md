# MongoDB Atlas Setup Guide

## 🚀 Setting up MongoDB Atlas with Replica Set

MongoDB Atlas automatically provides replica set configuration with high availability, automatic failover, and data redundancy.

### 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Verify your email address

### 2. Create a New Cluster

1. **Choose Deployment Type**: Select "Database"
2. **Choose Configuration**:
   - **FREE Tier (M0)**: Good for development/testing
   - **M2 ($9/month)**: Recommended for SIH production
   - **M5 ($25/month)**: For high traffic
3. **Cloud Provider**: Choose AWS, Google Cloud, or Azure
4. **Region**: Select closest to your users (e.g., Mumbai for India)
5. **Cluster Name**: `sih-registration-cluster`

### 3. Configure Security

#### Database User:

1. Go to "Database Access" → "Add New Database User"
2. **Authentication Method**: Password
3. **Username**: `sih-admin`
4. **Password**: Generate secure password
5. **Database User Privileges**: Read and write to any database
6. Click "Add User"

#### Network Access:

1. Go to "Network Access" → "Add IP Address"
2. **For Development**: Add your current IP
3. **For Production**: Add your server's IP address
4. **For Testing**: You can use `0.0.0.0/0` (allows all IPs - not recommended for production)

### 4. Get Connection String

1. Go to "Database" → "Connect" → "Connect your application"
2. **Driver**: Node.js
3. **Version**: 4.1 or later
4. **Copy the connection string**:
   ```
   mongodb+srv://<username>:<password>@sih-registration-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 5. Update Environment Variables

In your `.env.local` file:

```bash
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://sih-admin:YOUR_PASSWORD@sih-registration-cluster.xxxxx.mongodb.net/sih-reg?retryWrites=true&w=majority
```

**Replace**:

- `YOUR_PASSWORD` with your database user password
- `xxxxx` with your actual cluster identifier
- `sih-reg` with your desired database name

### 6. Test Connection

Run your application:

```bash
npm run dev
```

You should see in the logs:

```
✅ MongoDB Atlas connected successfully
📊 Connection state: 1
🔗 Database: sih-reg
🔄 Replica Set: atlas-xxxxx-shard-0 (3 members)
```

## 🎯 Recommended Atlas Configuration for SIH (50 Teams Max)

### For Development/Testing:

- **Tier**: M0 (Free)
- **Storage**: 512MB
- **Connections**: 500
- **Cost**: FREE

### For Production (Recommended for 50 Teams):

- **Tier**: M0 (Free) - **Perfect for 50 teams!**
- **Storage**: 512MB (more than enough)
- **Connections**: 500 (way more than needed)
- **Backup**: Basic automated backup included
- **Cost**: **FREE**

### Alternative (If you want premium features):

- **Tier**: M2
- **Storage**: 2GB
- **Connections**: 500
- **Performance**: Better performance monitoring
- **Cost**: $9/month

## 🔒 Security Best Practices

1. **Use Strong Passwords**: Generate complex passwords
2. **Whitelist IPs**: Only allow specific IP addresses
3. **Rotate Credentials**: Change passwords periodically
4. **Enable Monitoring**: Set up Atlas alerts
5. **Backup Strategy**: Enable point-in-time recovery

## 📊 Replica Set Benefits

✅ **Automatic Failover**: If primary goes down, secondary takes over  
✅ **Data Redundancy**: 3 copies of your data across different zones  
✅ **Zero Downtime**: Maintenance without service interruption  
✅ **Read Scaling**: Distribute read operations across secondaries  
✅ **99.995% Uptime SLA**: Enterprise-grade availability

## 🛠️ Connection Features Enabled

Our MongoDB configuration includes:

- **Connection Pooling**: Efficient connection reuse
- **Automatic Retries**: Retry failed operations
- **Write Concern**: Wait for majority acknowledgment
- **Read Preference**: Primary preferred with secondary fallback
- **Timeouts**: Proper timeout handling
- **Monitoring**: Connection state logging

## 📈 Scaling for SIH (50 Teams)

For **50 teams** and **300 users**:

- **M0 Free Cluster**: More than sufficient
- **Storage Usage**: ~50-100MB total (team data + file metadata)
- **Concurrent Connections**: Max 20-30 (well under 500 limit)
- **Performance**: Excellent response times
- **Backup**: Automatic daily backups included

**Perfect fit for M0 Free Tier!** 🎉

## 💰 Cost Estimation (50 Teams)

```
🎉 COMPLETELY FREE SOLUTION:

Development: FREE (M0 cluster)
Testing: FREE (M0 cluster)
Production: FREE (M0 cluster)
Event Duration: 3 months = $0 total

Additional Services:
- Firebase Auth: FREE (under 10k users)
- Cloudinary: FREE (under 25GB)
- Vercel Hosting: FREE (hobby tier)
```

**Total Cost for SIH Event with 50 Teams**: **$0** 🎉

You can run the entire hackathon completely free!
