"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadPermissions = exports.Permission = void 0;
var Permission;
(function (Permission) {
    Permission["CREATE"] = "Create";
    Permission["READ"] = "Read";
    Permission["UPDATE"] = "Update";
    Permission["DELETE"] = "Delete";
})(Permission || (exports.Permission = Permission = {}));
var LeadPermissions;
(function (LeadPermissions) {
    LeadPermissions["CREATE"] = "Create";
    LeadPermissions["VIEW"] = "View";
    LeadPermissions["ASSIGN"] = "Assign";
    LeadPermissions["ADDNOTES"] = "AddNotes";
    LeadPermissions["DELETENOTES"] = "DeleteNotes";
    LeadPermissions["HISTORY"] = "History";
    LeadPermissions["EDIT"] = "Edit";
    LeadPermissions["DELETE"] = "Delete";
    LeadPermissions["DELETEALL"] = "DeleteAll";
    LeadPermissions["IMPORTBULK"] = "ImportBulk";
})(LeadPermissions || (exports.LeadPermissions = LeadPermissions = {}));
