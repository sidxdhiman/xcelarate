import {Request, Response} from "express";
import mongoose from "mongoose";
// import { PostService } from "../service/postService";
const {PostOrganization} = require("../service/postService");
const {GetOrganization} = require("../service/getService");
import xlsx from 'xlsx';
import { Organization } from '../database/index';

export class orgController {
    public static async postOrg(req: Request, res: Response) {
        try {
            const orgData = req.body
            const organization = await new PostOrganization().postOrganization(orgData);
            if (organization) {
                res.json(organization);
            } else {
                res.status(404).json({message: "Organization not posted"});
            }
        } catch (error: any) {
            console.error("Error in postOrg controller:", error);
            res.status(500).json({message: error.message || "Internal server error"});
        }
    }
    public static async getOrg(req: Request, res: Response) {
        try {
          const organizations = await new GetOrganization().getOrganizations();
          if (organizations) {
            res.json(organizations);
          } else {
            res.status(404).json({ message: "Organizations not found!" });
          }
        } catch (error) {
          res.status(500).json({ message: "Internal Server error!-GET" });
        }
      }
    public static async postOrgBulk(req: Request, res: Response) {
    
        if (!req.file) {
          return res.status(400).json({ msg: 'No file uploaded.' });
        }
    
        try {
          // Read the Excel file from the buffer
          const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const data: any[] = xlsx.utils.sheet_to_json(worksheet);
    
          const processedOrgs = [];
    
          // Loop through each row from the Excel file
          for (const row of data) {
            
            // --- This is the "Find or Create" logic ---
    
            // Get the organization name from the row.
            // !! MUST MATCH your Excel column header !!
            const orgName = String(row.OrganizationName || '').trim(); 
            if (!orgName) continue; // Skip empty rows
    
            // A) The query to find the document
            const query = { organization: orgName }; // Matches your schema field 'organization'
    
            // B) The data to insert *if* it's new
            // !! ALL row properties MUST MATCH your Excel column headers !!
            const update = {
              $setOnInsert: {
                organization: orgName,
                spoc: row.SPOC,
                spoc_email: row.SpocEmail,
                spoc_contact: row.SpocContact,
                org_location: row.Location,
                businessUnit: row.BusinessUnit,
                industry: row.Industry
              }
            };
    
            // C) The options to enable "upsert"
            const options = {
              upsert: true,  // <-- "find OR create"
              new: true,     // <-- Return the new (or found) document
            };
    
            // D) Run the command
            const organization = await Organization.findOneAndUpdate(query, update, options);
            
            processedOrgs.push(organization);
          }
    
          res.status(200).json({
            msg: `Successfully processed ${data.length} records.`,
            data: processedOrgs
          });
    
        } catch (err: any) {
          console.error("Error in postOrgBulk:", err.message);
          if (err.code === 11000) {
            return res.status(400).json({ msg: 'Duplicate key error. Your Excel file may have duplicates, or you forgot to add the unique index to the schema.', error: err.keyValue });
          }
          res.status(500).send('Server Error');
        }
    }
}