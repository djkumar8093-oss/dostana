import { SearchSharp } from "@mui/icons-material";
import { Avatar, Card, IconButton, InputAdornment, List, ListItemButton, ListItemIcon, ListItemText, Stack, TextField, Typography } from "@mui/material";
import Lottie from "lottie-react";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { noResultFound, searchingPeople } from "../../animation";
import { motion } from "framer-motion";
import { debounce } from "lodash";
import { useNavigate } from "react-router-dom";
import { useSearchUsers } from "../../hooks/userProfile/userProfile";

const PeopleSearch = ({ onActiveChange }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const cardRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Compute "active": true if field is focused or has a non-empty value
  const active = isFocused || searchQuery.trim() !== "";

  // Notify parent whenever the computed active state changes
  useEffect(() => {
    onActiveChange && onActiveChange(active);
  }, [active, onActiveChange]);

  // Fetch search results using the debounced query
  const { data: results = [], isLoading, isError } = useSearchUsers(debouncedQuery);

  // Debounced updater for the query
  const updateDebouncedQuery = useMemo(
    () =>
      debounce((query) => {
        setDebouncedQuery(query);
      }, 700),
    []
  );

  // Handle input changes
  const handleInputChange = useCallback(
    (e) => {
      setSearchQuery(e.target.value);
      updateDebouncedQuery(e.target.value);
    },
    [updateDebouncedQuery]
  );

  // Focus the input field
  const handleFocusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // When selecting a result, close the search (set active false)
  const handleListButtonClick = useCallback(
    (result) => {
      setSearchQuery(result.name);
      setIsFocused(false);
      onActiveChange && onActiveChange(false);
      console.log(result._id);
      navigate(`/user-profile/${result._id}`);
    },
    [navigate, onActiveChange]
  );

  // Listen for clicks outside the search card
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target) && inputRef.current && !inputRef.current.contains(event.target)) {
        setIsFocused(false);
        // Only trigger inactive if there's no text value
        if (searchQuery.trim() === "") {
          onActiveChange && onActiveChange(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchQuery, onActiveChange]);

  // On blur, update focus state. (This will be overridden if a click happens on the card.)
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setSearchQuery("");

    if (searchQuery.trim() === "") {
      onActiveChange && onActiveChange(false);
    }
  }, [searchQuery, onActiveChange]);

  useEffect(() => {
    if (isError) {
      console.error("Error fetching search results");
    }
  }, [isError]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      updateDebouncedQuery.cancel();
    };
  }, [updateDebouncedQuery]);

  // Memoize search results to prevent unnecessary re-renders
  const memoizedResults = useMemo(() => results, [results]);

  return (
    <Stack
      marginRight="0.4rem"
      position="relative"
      maxWidth="100%"
      sx={{
        transition: "width 0.3s",
        // On small screens, expand to full width when active; otherwise shrink.
        width: { xs: "100%", md: active ? "20rem" : "15rem" },
      }}
    >
      <TextField
        variant="standard"
        placeholder="Search for people"
        inputRef={inputRef}
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        sx={{ width: "100%" }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleFocusInput}>
                  <SearchSharp />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        autoComplete="off"
      />

      {/* Search Results Card */}
      {isFocused && debouncedQuery.trim().length > 2 && (
        <Card
          ref={cardRef}
          sx={{
            width: "100%",
            position: "absolute",
            top: "2rem",
            left: 0,
            maxHeight: isLoading ? "20rem" : "none",
            overflow: isLoading ? "hidden" : "visible",
            boxShadow: 2,
          }}
        >
          <Stack height={memoizedResults.length > 0 && !isLoading ? "auto" : { xs: "15rem", md: "20rem" }} justifyContent="center" alignItems="center" position="relative">
            {/* Loading Animation */}
            {isLoading && <Lottie animationData={searchingPeople} style={{ height: "100%", width: "100%" }} />}

            {/* No Results Animation */}
            {!isLoading && memoizedResults.length === 0 && (
              <>
                <Lottie animationData={noResultFound} style={{ height: "60%", width: "60%" }} loop={false} />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    position: "absolute",
                    bottom: "10%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                  }}
                >
                  <Typography
                    variant="body1"
                    noWrap
                    sx={{
                      fontWeight: "bold",
                      transform: "translateY(-1rem)",
                      fontSize: { xs: ".8rem", md: "1.2rem" },
                    }}
                  >
                    No Results Found
                  </Typography>
                </motion.div>
              </>
            )}

            {/* Search Results */}
            {!isLoading && memoizedResults.length > 0 && (
              <List
                sx={{
                  width: "100%",
                  maxHeight: "20rem",
                  overflowY: memoizedResults.length > 5 ? "auto" : "hidden",
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                  msOverflowStyle: "none",
                }}
                key={1}
              >
                {memoizedResults.map((result, index) => (
                  <ListItemButton
                    key={index}
                    sx={{ padding: "0.8rem" }}
                    onMouseDown={(e) => e.preventDefault()} // Prevents the input from blurring
                    onClick={() => handleListButtonClick(result)}
                  >
                    <ListItemIcon>
                      <Avatar src={result.profileImage || ""} alt={result.name} sx={{ boxShadow: 3 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          {result.name}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Stack>
        </Card>
      )}
    </Stack>
  );
};

export default PeopleSearch;
