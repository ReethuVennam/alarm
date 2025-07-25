# Migration from localStorage to Database

## Current State
The app is currently using **localStorage** for data persistence to get it working quickly without database setup.

## Benefits of Current Setup
- ✅ **No database setup required**
- ✅ **Instant development** - works immediately
- ✅ **No server costs** - purely client-side storage
- ✅ **Fast performance** - no network calls for data
- ✅ **Works offline** - data persists locally

## Limitations of Current Setup
- ❌ **Single device only** - data doesn't sync across devices
- ❌ **Browser dependent** - clearing browser data = lost alarms
- ❌ **No backup** - data can be lost if browser crashes
- ❌ **Storage limits** - browser localStorage has size limits

## When to Migrate to Database

Migrate when you need:
1. **Multi-device sync** - access alarms from phone, tablet, computer
2. **Data backup** - ensure alarms are never lost
3. **User accounts** - personalized alarm management
4. **Advanced features** - sharing alarms, team features, analytics

## Migration Steps

### 1. **Export Current Data**
The localStorage hook has built-in export functionality:
```javascript
const { exportData } = useLocalStorageAlarms();
const data = exportData();
console.log('Exported data:', data);
```

### 2. **Set Up Database**
- Add `DATABASE_URL` environment variable in Vercel
- Run `npm run db:push` to create tables

### 3. **Switch Back to Database Hooks**
Replace imports in these files:
- `client/src/pages/home.tsx`
- `client/src/components/AlarmForm.tsx`
- `client/src/components/AlarmList.tsx`
- `client/src/components/AlarmModal.tsx`

Change from:
```typescript
import { useLocalStorageAlarms as useAlarms } from "@/hooks/useLocalStorageAlarms";
```

Back to:
```typescript
import { useAlarms } from "@/hooks/useAlarms";
```

### 4. **Import Existing Data**
Use the import functionality to migrate localStorage data to database:
```javascript
const { importData } = useAlarms(); // database version
importData(exportedData);
```

### 5. **Update API Functions**
Switch back to database storage in:
- `api/alarms.ts`
- `api/alarms/[id].ts`

Change from:
```typescript
// Mock responses for localStorage
```

Back to:
```typescript
import { storage } from './_lib/storage';
// Use real database operations
```

## Files to Update for Migration

### Client-Side (Switch Hooks)
```
client/src/pages/home.tsx
client/src/components/AlarmForm.tsx
client/src/components/AlarmList.tsx
client/src/components/AlarmModal.tsx
```

### Server-Side (Restore Database)
```
api/alarms.ts
api/alarms/[id].ts
```

### Environment
```
Add DATABASE_URL to Vercel environment variables
```

## Testing Migration

1. **Export data** from localStorage version
2. **Switch to database** version
3. **Import data** to verify migration
4. **Test all features** work with database
5. **Deploy to production**

## Rollback Plan

If migration fails:
1. **Switch imports back** to localStorage versions
2. **Redeploy** previous working version
3. **Debug issues** in development
4. **Retry migration** once fixed

## Current File Structure

```
localStorage Implementation:
├── client/src/hooks/useLocalStorageAlarms.ts  ← Current main hook
├── api/_lib/localStorage.ts                   ← Client-side utilities
├── api/alarms.ts                              ← Mock API responses
└── api/alarms/[id].ts                         ← Mock API responses

Database Implementation (Ready):
├── client/src/hooks/useAlarms.ts              ← Database hook (ready)
├── api/_lib/storage.ts                        ← Database operations (ready)
├── api/alarms.ts                              ← Real API (needs switch)
└── api/alarms/[id].ts                         ← Real API (needs switch)
```

**The database implementation is already built and ready - just need to switch the imports when you're ready!**