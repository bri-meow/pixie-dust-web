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
import dayjs from "dayjs";

import {
  Box,
  Button,
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
import { Delete, EmojiEvents, NotificationsActive } from "@mui/icons-material";
import { grey } from "@mui/material/colors";
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
  const defaultDate = dayjs().add(1, "day");
  const [park, setPark] = useState("Both");
  const [notificationUser, setNotificationUser] = useState(
    user.displayName.split(" ")[0].toLowerCase()
  );
  const [alerts, setAlerts] = useState([]);
  const [date, setDate] = React.useState(defaultDate);

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
        setAlerts(newData);
      }
    );

    return () => unsubscribe(); // Unsubscribe when component unmounts
  }, []);

  return (
    <Box py={2} px={{ xs: 0.5, sm: 2 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="center"
      >
        <FormControl sx={{ m: 1, minWidth: 250 }}>
          <InputLabel id="park-label">Park</InputLabel>
          <Select
            labelId="park-label"
            id="park-select"
            value={park}
            label="Park"
            onChange={(e) => setPark(e.target.value)}
          >
            <MenuItem value={"DL"}>Disneyland</MenuItem>
            <MenuItem value={"DCA"}>Disney California Adventure</MenuItem>
            <MenuItem value={"Both"}>Both</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ m: 1, minWidth: 250 }}>
          <InputLabel id="notificationUser-label">User to Notify</InputLabel>
          <Select
            labelId="notificationUser-label"
            id="notificationUser-select"
            value={notificationUser}
            label="User to Notify"
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
                  <TableCell align="left">{alert.user}</TableCell>
                  {!isSmall && (
                    <TableCell align="left">
                      <Typography variant="caption">
                        {moment(alert.createdAt).format("MMM D, h:mm:ss A")}
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell align="left">
                    <Typography variant="caption">
                      {alert.lastFoundAt &&
                        (isSmall
                          ? moment(alert.lastFoundAt).format("h:mm")
                          : moment(alert.lastFoundAt).format(
                              "MMM D, h:mm:ss A"
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
                  <TableCell align="right">
                    <Stack direction="row">
                      {!!alert.deactivatedAt && (
                        <IconButton aria-label="reactivate">
                          <EmojiEvents
                            fontSize="small"
                            color="success"
                            onClick={() => reactivateAlert(alert)}
                          />
                        </IconButton>
                      )}
                      <IconButton aria-label="delete">
                        <Delete
                          fontSize="small"
                          onClick={() => deleteAlert(alert.id)}
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

export default Alert;
