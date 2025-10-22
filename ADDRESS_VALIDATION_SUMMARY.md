# Address Validation & Duplicate Prevention

## 🎯 Requirements Implemented

### 1. **5-Address Limit Enforcement** ✅
Users cannot save more than 5 addresses. If they try to add a 6th address, they must delete one first.

### 2. **Duplicate Address Prevention** ✅
The system checks if an address already exists before saving to prevent duplicates.

### 3. **Clear User Guidance** ✅
Users see helpful messages about their address limit and how to manage addresses.

---

## 🔧 Changes Made

### 1. API Validation (`/src/app/api/addresses/route.ts`)

#### Duplicate Check (NEW)
```typescript
// Check for duplicate address
const existingAddress = await prisma.addresses.findFirst({
  where: {
    userId,
    street,
    city,
    state,
    zip,
    country
  }
});

if (existingAddress) {
  return NextResponse.json(
    { 
      error: 'This address already exists in your saved addresses.',
      code: 'DUPLICATE_ADDRESS'
    },
    { status: 400 }
  );
}
```

#### 5-Address Limit (ENHANCED)
```typescript
// Check if user already has 5 addresses
const addressCount = await prisma.addresses.count({
  where: { userId }
});

if (addressCount >= 5) {
  return NextResponse.json(
    { 
      error: 'You have reached the maximum limit of 5 saved addresses. Please delete an existing address before adding a new one.',
      code: 'ADDRESS_LIMIT_REACHED',
      currentCount: addressCount,
      maxLimit: 5
    },
    { status: 400 }
  );
}
```

### 2. Frontend Error Handling (`AddressFormModal.tsx`)

#### Specific Error Messages
```typescript
if (data.code === 'ADDRESS_LIMIT_REACHED') {
  toast.error(
    `${data.error}\n\nManage your addresses to delete one before adding new.`,
    { duration: 6000 }
  );
} else if (data.code === 'DUPLICATE_ADDRESS') {
  toast.error(data.error, { duration: 4000 });
} else {
  toast.error(data.error || "Failed to add address");
}
```

### 3. Visual Indicators (`AddressSelector.tsx`)

#### Address Count Display
```tsx
<div>
  <h3 className="text-lg font-medium text-gray-900">Select Shipping Address</h3>
  <p className="text-sm text-gray-500 mt-1">
    {addresses.length} of 5 addresses saved
  </p>
</div>
```

#### Smart Tip Messages
```tsx
{addresses.length < 5 ? (
  <>
    💡 You can save up to 5 addresses. You have {5 - addresses.length} slot{5 - addresses.length !== 1 ? 's' : ''} remaining.{" "}
    <Link href="/addresses">Manage addresses</Link>
  </>
) : (
  <>
    ⚠️ You have reached the maximum limit of 5 addresses.{" "}
    <Link href="/addresses">Delete an address</Link> to add a new one.
  </>
)}
```

---

## 🎨 User Experience

### Scenario 1: User Has 3 Addresses
**What they see:**
- "3 of 5 addresses saved"
- "💡 You can save up to 5 addresses. You have 2 slots remaining."
- Can add new addresses normally

### Scenario 2: User Has 5 Addresses
**What they see:**
- "5 of 5 addresses saved"
- "⚠️ You have reached the maximum limit of 5 addresses. Delete an address to add a new one."
- If they try to add: Error toast with link to manage addresses

### Scenario 3: User Tries to Add Duplicate
**What happens:**
- System checks if exact address exists (street, city, state, zip, country)
- Shows error: "This address already exists in your saved addresses."
- Address is NOT saved

### Scenario 4: User Tries to Add 6th Address
**What happens:**
- System blocks the save
- Shows error: "You have reached the maximum limit of 5 saved addresses. Please delete an existing address before adding a new one."
- Provides link to manage addresses

---

## 🧪 Testing

### Test Case 1: Add Duplicate Address
```bash
# Steps:
1. Go to checkout
2. Try to add an address that already exists
3. Expected: Error message "This address already exists"
```

### Test Case 2: Reach 5-Address Limit
```bash
# Steps:
1. Add 5 addresses to your account
2. Try to add a 6th address
3. Expected: Error message about limit reached
4. Go to /addresses and delete one
5. Try adding again
6. Expected: Success
```

### Test Case 3: Visual Indicators
```bash
# Steps:
1. Have 3 addresses saved
2. Go to checkout
3. Expected: See "3 of 5 addresses saved"
4. Expected: See "You have 2 slots remaining"
```

---

## 🔧 Cleanup Script

### Fix Existing Duplicates
Created: `scripts/fix-duplicate-addresses.ts`

**Run it:**
```bash
npm run fix:duplicate-addresses
```

**What it does:**
1. Scans all users' addresses
2. Groups by content (street, city, state, zip, country)
3. Finds duplicates
4. Keeps one (preferring default address)
5. Deletes all duplicates

**Example output:**
```
🔍 Checking for duplicate addresses...

👤 User: user@example.com
   Total addresses: 6

   🔴 Found 6 duplicate addresses:
      H-2 Cross 2B Tapovan Enclave Raipur Road, Dehradun, Uttarakhand

      ✅ Keeping: abc123 (default)
      ❌ Removing 5 duplicate(s)

   ✅ Removed 5 duplicate(s)
   📊 Final count: 1 unique address(es)

✅ Cleanup complete!
   Total duplicates removed: 5
```

---

## 📊 Validation Rules

### Address Uniqueness
An address is considered duplicate if ALL these fields match:
- `street`
- `city`
- `state`
- `zip`
- `country`

### Address Limit
- **Maximum**: 5 addresses per user
- **Enforced**: At API level (cannot be bypassed)
- **User Action**: Must delete an address to add new one

### Required Fields
All these fields are required to save an address:
- `street`
- `city`
- `state`
- `zip` (must be 6 digits)
- `country`

---

## 🔗 Related Files

### Modified Files
1. `/src/app/api/addresses/route.ts` - Added duplicate check and enhanced limit error
2. `/src/components/Checkout/AddressFormModal.tsx` - Added specific error handling
3. `/src/components/Checkout/AddressSelector.tsx` - Added visual indicators

### New Files
1. `/scripts/fix-duplicate-addresses.ts` - Cleanup script for existing duplicates
2. `/ADDRESS_VALIDATION_SUMMARY.md` - This documentation

### Related Pages
- `/addresses` - Address management page (already exists)
- `/checkout` - Checkout page with address selection

---

## ✅ Summary

### What's Fixed
1. ✅ **Duplicate prevention** - System checks before saving
2. ✅ **5-address limit** - Enforced at API level
3. ✅ **Clear error messages** - Users know exactly what to do
4. ✅ **Visual indicators** - Shows address count and remaining slots
5. ✅ **Helpful guidance** - Links to manage addresses when needed

### What Users See
- **Clear limits**: "3 of 5 addresses saved"
- **Helpful tips**: "You have 2 slots remaining"
- **Warning when full**: "Delete an address to add a new one"
- **Specific errors**: Different messages for duplicates vs limit
- **Easy management**: Links to address management page

### Benefits
- 🎯 **No more duplicates** - Same address won't be saved twice
- 🎯 **Clear limits** - Users know they can save up to 5
- 🎯 **Better UX** - Helpful messages guide users
- 🎯 **Easy management** - One-click to manage addresses
- 🎯 **Data integrity** - Clean, unique addresses in database

---

## 🚀 Next Steps

### Immediate
1. **Run cleanup script** to remove existing duplicates:
   ```bash
   npm run fix:duplicate-addresses
   ```

2. **Test the validation**:
   - Try adding duplicate address
   - Try adding 6th address
   - Verify error messages

### Optional Enhancements
1. **Address verification** - Validate addresses with postal service API
2. **Address autocomplete** - Google Places API integration
3. **Bulk delete** - Allow deleting multiple addresses at once
4. **Address nicknames** - Let users name their addresses (e.g., "Home", "Office")

---

**Status**: ✅ All validation implemented and ready to use!
