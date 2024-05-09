import express from "express";
import { auth } from "../middlewares/auth";
import { permissionsController } from "../controllers";
import { connectionRequest } from "../middlewares/connectionResolver";

const router = express.Router();

router
  .route("/")
  .post(
    auth("managePermissions"),
    connectionRequest,
    permissionsController.createPermission,
  )
  .get(
    auth("viewPermissions"),
    connectionRequest,
    permissionsController.getAllPermissions,
  );

router.get(
  "/roles",
  auth("viewPermissions"),
  connectionRequest,
  permissionsController.getRoles,
);

router
  .route("/:permissionId")
  .get(
    auth("viewPermissions"),
    connectionRequest,
    permissionsController.getPermission,
  )
  .patch(
    auth("managePermissions"),
    connectionRequest,
    permissionsController.updatePermission,
  )
  .delete(
    auth("managePermissions"),
    connectionRequest,
    permissionsController.deletePermission,
  );

export default router;
