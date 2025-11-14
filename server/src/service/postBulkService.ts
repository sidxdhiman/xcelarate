// 1. IMPORT BOTH MODELS
import { User, Organization } from "../database/index";

export class PostBulk {
    public async postBulkUsers(userData: any[]): Promise<any> {
      try {
        
        // --- 2. ADD THIS BLOCK TO PROCESS ORGANIZATIONS FIRST ---
        
        // Create a map to get unique organization names from the file
        const orgMap = new Map();
        for (const row of userData) {
            // Use 'organization' (from your schema) or 'OrganizationName' (from org-only upload)
            // Let's stick to the headers in your CSV
            const orgName = String(row.organization || '').trim(); 
            if (orgName && !orgMap.has(orgName)) {
                
                // This object matches your organizationSchema
                orgMap.set(orgName, {
                    organization: orgName,
                    spoc: row.spoc,
                    spoc_email: row.spoc_email,
                    spoc_contact: row.spoc_contact,
                    org_location: row.org_location,
                    businessUnit: row.businessUnit,
                    industry: row.industry
                });
            }
        }

        // Create the "find or create" operations
        const orgOps = Array.from(orgMap.values()).map(org => ({
            updateOne: {
                filter: { organization: org.organization }, // Find by unique name
                update: { $setOnInsert: org },            // Create if not found
                upsert: true
            }
        }));

        // Execute all organization operations at once
        if (orgOps.length > 0) {
            await Organization.bulkWrite(orgOps);
            console.log("Organizations processed successfully.");
        }
        
        // --- 3. YOUR EXISTING CODE NOW RUNS ---
        // This is safe. Mongoose will just ignore the extra org fields,
        // but you've already saved them in the Organization collection.
        const users = await User.insertMany(userData);
        console.log("Users posted Successfully");
        
        return users; // Return the list of created users

      } catch (error) {
        console.log("Error in inserting bulk users", error);
        throw new Error("Error in uploading bulk users");
      }
    };
  };