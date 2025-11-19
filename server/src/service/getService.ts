// import { IntegerType } from "mongodb";
// import { Organization, User, Assessment, Response } from "../database";
// import mongoose from "mongoose";

// export class GetService {
//   public async getUsers() {
//     try {
//       const users = await User.find({});
//       return users;
//     } catch (error) {
//       console.error("Error fetching users from database:", error);
//       throw new Error('Error fetching users');
//     }
//   }
// }
// export class GetByIdService {
//   public async getUserbyId(userId: String){
//     try {
//       const result = await User.findOne({userId: userId});
//       return result;
//     } catch (error) {
//       console.error("Error fetching user", error);
//       throw new Error('Error fetching users');
//     }
//   }
// }
// export class GetOrganization {
//   public async getOrganizations() {
//     try {
//       const organizations = await Organization.find({});
//       return organizations;
//     } catch (error) {
//       console.error("Error fetching data from database:", error);
//       throw new Error('Error fetching data');
//     }
//   }
// }
// export class GetAssessment {
//   public async getAssessment() {
//     try {
//       const assessments = await Assessment.find({});
//       return assessments;
//     } catch (error) {
//       console.error("Error in fetching Assessments", error);
//       throw new Error('Error in fetching data');
//     }
//   }
// }

// export class GetAssessmentById {
//   public async getAssessmentbyId(Id: string) {
//     try {
//       const assessment = await Assessment.findById(Id);
//       return assessment;
//     } catch (error) {
//       console.error("Error fetching the Assessment", error);
//       throw new Error("Error fetching assessment");
//     }
//   }
// }

// export class GetResponseByAssessmentId {
//   public async getResponseByAssessmentId(id: string) {
//     try {
//       const response = await Response.find({ assessmentId: id });
//       return response;
//     } catch (error) {
//       console.log("Error fetching response:", error);
//       throw new Error("Error fetching response by assessment ID");
//     }
//   }
// }

// export class GetRoles {
//   public async getRoles() {
//     try {
//       const roles = await User.distinct("role");
//       return roles;
//     } catch (error) {
//       console.error("Error fetching roles:", error);
//       throw new Error("Error fetching roles");
//     }
//   }
// }

import { IntegerType } from "mongodb";
import { Organization, User, Assessment, Response } from "../database";
import mongoose from "mongoose";

// --- EXISTING SERVICES ---

export class GetService {
  public async getUsers() {
    try {
      const users = await User.find({});
      return users;
    } catch (error) {
      console.error("Error fetching users from database:", error);
      throw new Error("Error fetching users");
    }
  }
}
export class GetByIdService {
  public async getUserbyId(userId: String) {
    try {
      const result = await User.findOne({ userId: userId });
      return result;
    } catch (error) {
      console.error("Error fetching user", error);
      throw new Error("Error fetching users");
    }
  }
}
export class GetOrganization {
  public async getOrganizations() {
    try {
      const organizations = await Organization.find({});
      return organizations;
    } catch (error) {
      console.error("Error fetching data from database:", error);
      throw new Error("Error fetching data");
    }
  }
}
export class GetAssessment {
  public async getAssessment() {
    try {
      const assessments = await Assessment.find({});
      return assessments;
    } catch (error) {
      console.error("Error in fetching Assessments", error);
      throw new Error("Error in fetching data");
    }
  }
}

export class GetAssessmentById {
  public async getAssessmentbyId(Id: string) {
    try {
      const assessment = await Assessment.findById(Id);
      return assessment;
    } catch (error) {
      console.error("Error fetching the Assessment", error);
      throw new Error("Error fetching assessment");
    }
  }
}

export class GetResponseByAssessmentId {
  public async getResponseByAssessmentId(id: string) {
    try {
      const response = await Response.find({ assessmentId: id });
      return response;
    } catch (error) {
      console.log("Error fetching response:", error);
      throw new Error("Error fetching response by assessment ID");
    }
  }
}

export class GetRoles {
  public async getRoles() {
    try {
      const roles = await User.distinct("role");
      return roles;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw new Error("Error fetching roles");
    }
  }
}

// --- NEW GET LOGIC FOR PROGRESS REPORTING ---

export class GetUserByEmail {
  public async getUserByEmail(email: string) {
    try {
      const user = await User.findOne({ email });
      return user;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      throw new Error("Error fetching user");
    }
  }
}

export class GetResponsesByUserEmail {
  public async getResponsesByUserEmail(
    assessmentId: string,
    userEmail: string,
  ) {
    try {
      // Finds if this user has submitted a response for the given assessment.
      const response = await Response.findOne({
        assessmentId,
        "user.email": userEmail,
        submittedAt: { $exists: true, $ne: null }, // Ensure it's completed
      });
      return response;
    } catch (error) {
      console.error("Error fetching response by user email:", error);
      throw new Error("Error fetching response");
    }
  }
}

export class GetUsersByFilter {
  public async getUsersByFilter(filterType: string, filterValues: string[]) {
    try {
      let query: any = {};
      if (filterType === "role") {
        query.role = { $in: filterValues };
      } else if (filterType === "organization") {
        query.organization = { $in: filterValues };
      } else {
        throw new Error("Invalid filter type specified");
      }

      const users = await User.find(query).lean().exec();
      return users;
    } catch (error) {
      console.error("Error fetching users by filter:", error);
      throw new Error("Error fetching users by filter");
    }
  }
}
