import React, { useEffect, useState, useContext } from "react";

import { db } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

import moment from "moment";

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  FormControl,
  InputLabel,
  Icon,
  IconButton,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Typography,
} from "@mui/material";
import {
  Delete,
  PlayCircle,
  MenuBookTwoTone,
  NotificationsActive,
} from "@mui/icons-material";
import { blue, grey } from "@mui/material/colors";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import "../App.css";
import { AuthContext } from "../AuthContext";

const getIcon = (park) => {
  switch (park) {
    case "Both":
      return <BothParksIcon />;
    case "DL":
      return <DisneylandIcon />;
    case "DCA":
      return <CaliforniaAdventureIcon />;
    default:
      return "oops";
  }
};

const Alert = () => {
  const { user, logout } = useContext(AuthContext);
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const defaultDate = null;
  const [park, setPark] = useState("Both");
  const [notificationUser, setNotificationUser] = useState(
    user.displayName.split(" ")[0].toLowerCase()
  );
  const [alerts, setAlerts] = useState([]);
  const [date, setDate] = React.useState(defaultDate);
  const [alertToDelete, setAlertToDelete] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [alertForDetails, setAlertForDetails] = useState(null);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const handleCloseDeleteModal = () => {
    setAlertToDelete(null);
    setOpenDeleteModal(false);
  };

  const handleCloseDetailsModal = () => {
    setAlertForDetails(null);
    setOpenDetailsModal(false);
  };

  const isButtonDisabled = !park || !date || !notificationUser;

  const addAlert = async (e) => {
    e.preventDefault();

    try {
      const docRef = await addDoc(collection(db, "test-alerts"), {
        park: park,
        date: date.format("YYYY-MM-DD"),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastFoundAt: null,
        deactivatedAt: null,
        notificationCount: 0,
        user: notificationUser,
      });
      console.log("Document written with ID: ", docRef.id);
      setPark("Both");
      setDate(defaultDate);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const deleteAlert = async (documentId) => {
    try {
      await deleteDoc(doc(db, "test-alerts", documentId));
      console.log("Document successfully deleted!");
      handleCloseDeleteModal();
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };

  const reactivateAlert = async (alert) => {
    try {
      const docRef = doc(db, "test-alerts", alert.id);

      await updateDoc(docRef, {
        park: alert.park,
        date: alert.date,
        createdAt: alert.createdAt,
        updatedAt: new Date().toISOString(),
        lastFoundAt: alert.lastFoundAt,
        deactivatedAt: null,
        notificationCount: 0,
        user: alert.user,
      });

      console.log("Document updated successfully!");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "test-alerts"),
      (querySnapshot) => {
        //console.log("fetching data");
        const newData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setAlerts(newData.sort((a, b) => new Date(a.date) - new Date(b.date)));
      }
    );

    return () => unsubscribe(); // Unsubscribe when component unmounts
  }, []);

  useEffect(() => {
    if (alertToDelete) {
      setOpenDeleteModal(true);
    }

    if (alertForDetails) {
      setOpenDetailsModal(true);
    }
  }, [alertToDelete, alertForDetails]);

  return (
    <Box py={2} px={{ xs: 0.5, sm: 2 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="center"
      >
        <FormControl sx={{ m: 1, minWidth: 300 }}>
          <InputLabel id="park-label">Park</InputLabel>
          <Select
            labelId="park-label"
            id="park-select"
            value={park}
            label="Park"
            sx={{ height: "50px" }}
            onChange={(e) => setPark(e.target.value)}
          >
            <MenuItem value={"DL"}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="flex-start"
                spacing={2}
              >
                <Box>{getIcon("DL")}</Box> <Typography>Disneyland</Typography>
              </Stack>
            </MenuItem>
            <MenuItem value={"DCA"}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="flex-start"
                spacing={2}
              >
                <Box>{getIcon("DCA")}</Box>{" "}
                <Typography>Disney California Adventure</Typography>
              </Stack>
            </MenuItem>
            <MenuItem value={"Both"}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="flex-start"
                spacing={2}
              >
                <Box>{getIcon("Both")}</Box> <Typography>Any Park</Typography>
              </Stack>
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ m: 1, minWidth: 150 }}>
          <InputLabel id="notificationUser-label">User to Notify</InputLabel>
          <Select
            labelId="notificationUser-label"
            id="notificationUser-select"
            value={notificationUser}
            label="User to Notify"
            size="small"
            sx={{ height: "50px" }}
            onChange={(e) => setNotificationUser(e.target.value)}
          >
            <MenuItem value={"bri"}>Bri</MenuItem>
            <MenuItem value={"ian"}>Ian</MenuItem>
            <MenuItem value={"both"}>Both</MenuItem>
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Choose Date"
            slotProps={{ textField: { size: "small" } }}
            sx={{
              "& .MuiInputBase-input": {
                height: "33px",
              },

              "& .MuiFormLabel-root": {
                top: 4,
              },
            }}
            value={date}
            onChange={(newValue) => setDate(newValue)}
          />
        </LocalizationProvider>

        <Button
          variant="contained"
          onClick={addAlert}
          disabled={isButtonDisabled}
        >
          Add Alert
        </Button>
      </Stack>

      <Box py={4} px={{ xs: 0, sm: 4 }}>
        <TableContainer component={Paper}>
          <Table
            {...(isSmall ? { size: "small" } : {})}
            padding="normal"
            sx={{ padding: 30 }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Park</TableCell>
                <TableCell align="left">Day</TableCell>
                <TableCell align="left">Date</TableCell>
                <TableCell align="center">
                  <NotificationsActive
                    fontSize="small"
                    sx={{ color: grey[600], verticalAlign: "top" }}
                  />
                </TableCell>
                {!isSmall && <TableCell align="left">CreatedAt</TableCell>}
                <TableCell align="left">Last</TableCell>
                {!isSmall && <TableCell align="left">Count</TableCell>}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alerts?.map((alert, i) => (
                <TableRow
                  hover
                  key={i}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align="left">{getIcon(alert.park)}</TableCell>
                  <TableCell align="left">
                    {moment(alert.date).format("dddd").substring(0, 2)}
                  </TableCell>
                  <TableCell align="left">
                    {isSmall ? moment(alert.date).format("M-D") : alert.date}
                  </TableCell>
                  <TableCell align="center">
                    {isSmall
                      ? alert.user.substring(0, 1).toUpperCase()
                      : alert.user}
                  </TableCell>
                  {!isSmall && (
                    <TableCell align="left">
                      <Typography variant="caption">
                        {moment(alert.createdAt).format("MMM D, h:mm:ss A")}
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell
                    align="left"
                    sx={{ paddingLeft: "4px", paddingRight: "0" }}
                  >
                    <Typography variant="caption">
                      {alert.lastFoundAt &&
                        (isSmall ? (
                          <Typography sx={{ fontSize: "0.7rem" }}>
                            {moment(alert.lastFoundAt).format("h:mm A")}
                          </Typography>
                        ) : (
                          moment(alert.lastFoundAt).format("MMM D, h:mm:ss A")
                        ))}
                    </Typography>
                  </TableCell>
                  {!isSmall && (
                    <TableCell align="left">
                      <Typography variant="caption">
                        {alert.notificationCount}
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell
                    align="right"
                    sx={{ paddingLeft: "0px", paddingRight: "2px" }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="flex-end"
                      spacing={0}
                    >
                      {!!alert.deactivatedAt && (
                        <IconButton sx={{ padding: 0 }} aria-label="reactivate">
                          <PlayCircle
                            fontSize="small"
                            color="success"
                            onClick={() => reactivateAlert(alert)}
                          />
                        </IconButton>
                      )}
                      <IconButton sx={{ padding: 0 }} aria-label="delete">
                        <Delete
                          fontSize="small"
                          onClick={() => setAlertToDelete(alert)}
                        />
                      </IconButton>
                      <IconButton sx={{ padding: 0 }} aria-label="more">
                        <MenuBookTwoTone
                          fontSize="small"
                          sx={{
                            color: blue[500],
                          }}
                          onClick={() => setAlertForDetails(alert)}
                        />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Button onClick={logout}>Logout</Button>
      <Dialog onClose={handleCloseDeleteModal} open={openDeleteModal}>
        <DialogTitle>Are you sure you want to delete this alert?</DialogTitle>
        <DialogContent>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="flex-start"
          >
            <Box>{getIcon(alertToDelete?.park)}</Box>
            <Typography>
              {moment(alertToDelete?.date).format("dddd")}
            </Typography>
            <Typography>{alertToDelete?.date}</Typography>
            <Typography>{alertToDelete?.user}</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleCloseDeleteModal}>
            No, oops
          </Button>
          <Button
            variant="contained"
            onClick={() => deleteAlert(alertToDelete?.id)}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog onClose={handleCloseDetailsModal} open={openDetailsModal}>
        <DialogTitle>Alert Details</DialogTitle>
        <DialogContent>
          <Stack
            spacing={2}
            alignItems="flex-start"
            justifyContent="flex-start"
          >
            <AlertDetailsRow>
              <Typography>Park:</Typography>
              <Stack direction="row" alignItems="center" spacing={3}>
                {getIcon(alertForDetails?.park)}
                <Typography>{alertForDetails?.park}</Typography>
              </Stack>
            </AlertDetailsRow>
            <AlertDetailsRow>
              <Typography>Date:</Typography>
              <Typography>
                {moment(alertForDetails?.date).format("dddd")},{" "}
                {alertForDetails?.date}
              </Typography>
            </AlertDetailsRow>
            <AlertDetailsRow>
              <Typography>User:</Typography>
              <Typography>{alertForDetails?.user}</Typography>
            </AlertDetailsRow>
            <AlertDetailsRow>
              <Typography>Last Seen:</Typography>
              <Typography>
                {alertForDetails?.lastFoundAt &&
                  moment(alertForDetails?.lastFoundAt).format(
                    "MMM D, h:mm:ss A"
                  )}
              </Typography>
            </AlertDetailsRow>
            <AlertDetailsRow>
              <Typography>Notification Count:</Typography>
              <Typography>{alertForDetails?.notificationCount}</Typography>
            </AlertDetailsRow>
            <AlertDetailsRow>
              <Typography>Status:</Typography>
              {alertForDetails?.deactivatedAt ? (
                <Chip label="Paused" color="warning" />
              ) : (
                <Chip label="Active" color="success" />
              )}
            </AlertDetailsRow>
            <AlertDetailsRow>
              <Typography>Created:</Typography>
              <Typography>
                {moment(alertForDetails?.createdAt).format("MMM D, h:mm:ss A")}
              </Typography>
            </AlertDetailsRow>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={handleCloseDetailsModal}
            color={grey[700]}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const DisneylandIcon = () => {
  return (
    <Icon
      sx={{
        fontFamily: "DisneyIcons",
        boxSizing: "content-box",
        padding: "3px",
        fontSize: "1.3rem",
      }}
    >
      <Box component="span" sx={{ color: "#dd1688" }}>
        
      </Box>
    </Icon>
  );
};

const CaliforniaAdventureIcon = () => {
  return (
    <Icon
      sx={{
        fontFamily: "DisneyIcons",
        boxSizing: "content-box",
        padding: "3px",
        fontSize: "1.3rem",
      }}
    >
      <Box component="span" sx={{ color: "#008896" }}>
        
      </Box>
    </Icon>
  );
};

const BothParksIcon = () => {
  return (
    <Icon
      sx={{
        fontFamily: "DisneyIcons",
        boxSizing: "content-box",
        padding: "3px",
        fontSize: "1.3rem",
        overflow: "visible",
      }}
    >
      <Box component="span" sx={{ marginLeft: "-5px", color: "#008896" }}>
        
      </Box>
      <Box component="span" sx={{ marginLeft: "-15px", color: "#dd1688" }}>
        
      </Box>
    </Icon>
  );
};

const AlertDetailsRow = (props) => {
  return (
    <Stack width="100%" direction="row" spacing={3} justifyContent="space-between" alignItems="center">
      {props.children}
    </Stack>
  );
};

export default Alert;
