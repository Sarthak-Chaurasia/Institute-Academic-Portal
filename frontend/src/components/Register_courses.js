import React, { useState, useEffect } from "react";
import api from "../api";

function RegisterCourses() {
  const [query, setQuery] = useState("");
  const [offerings, setOfferings] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [courseInfo, setCourseInfo] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [error, setError] = useState("");
  const [currentRegs, setCurrentRegs] = useState([]);

  // New states for changing tag
  const [changingTagFor, setChangingTagFor] = useState(null);
  const [allowedTags, setAllowedTags] = useState([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const { data } = await api.get("/register_courses/status");
      setCurrentRegs(data);
      api.get("/register_courses/offerings").then((res) => {
        setOfferings(res.data);
        setSuggestions(res.data);
        if (res.data.length > 0) {
          console.log("Offerings loaded:", res.data);
        }
      });
    } catch (e) {
      console.error("Failed to load current registrations:", e);
      setError("Could not fetch your registration status.");
    }
  };

  const refreshSuggestions = async (query) => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }
    try {
      const lowerQuery = query.toLowerCase();
  
      // 1. First, get offerings where course_id starts with query
      const prefixMatches = offerings.filter((offering) =>
        offering.course_id.toLowerCase().startsWith(lowerQuery)
      );
  
      // 2. Then, get offerings where course_id includes query (but not starting)
      const middleMatches = offerings.filter(
        (offering) =>
          !offering.course_id.toLowerCase().startsWith(lowerQuery) &&
          offering.course_id.toLowerCase().includes(lowerQuery)
      );
  
      // 3. Combine them: prefix matches first, then middle matches
      const matchedOfferings = [...prefixMatches, ...middleMatches];
  
      setSuggestions(matchedOfferings);
    } catch (e) {
      console.error("Search error:", e);
    }
  };
  

  // useEffect(() => {
  //   if (query.length < 1) {
  //     setSuggestions([]);
  //     return;
  //   }
  //   const timer = setTimeout(async () => {
  //     try {
  //       const { data } = await api.get(
  //         `/register_courses/search?query=${encodeURIComponent(query)}`
  //       );
  //       setSuggestions(data);
  //     } catch (e) {
  //       console.error("Search error:", e);
  //     }
  //   }, 200);
  //   return () => clearTimeout(timer);
  // }, [query]);

  const HandleQuery = async (query) => {
    setQuery(query);
    refreshSuggestions(query);
  };

  const chooseSuggestion = async (course) => {
    setCourseInfo(course);
    setQuery("");
    setSuggestions([]);
    setError("");

    try {
      const res = await api.get(`/register_courses/get_course/${course.course_id}`);
      setCourseInfo(res.data);
    } catch {
      setError("Could not load course details.");
      setCourseInfo(null);
      return;
    }

    try {
      const { data } = await api.get(`/register_courses/tags/${course.course_id}`);
      setTags(data.tags);
      setSelectedTag("");
    } catch {
      setError("Could not load tags for this course.");
      setTags([]);
    }
  };

  const handleRegister = async () => {
    if (!courseInfo || !selectedTag) return;
    try {
      await api.post("/register_courses/register", {
        offering_id: courseInfo.offering_id,
        tag: selectedTag,
      });
      setCourseInfo(null);
      setTags([]);
      setSelectedTag("");
      fetchStatus();
    } catch (e) {
      console.error("Register error:", e.response?.data || e);
      setError(`Registration failed: ${e.response?.data?.error || e.message}`);
    }
  };

  const handleDrop = async (offering_id) => {
    if (!window.confirm("Are you sure you want to drop this course?")) return;
    try {
      await api.delete(`/register_courses/${offering_id}`);
      fetchStatus();
    } catch (e) {
      console.error("Drop error:", e);
      setError("Could not drop the course.");
    }
  };

  const startChangeTag = async (offering_id, course_id) => {
    try {
      const { data } = await api.get(`/register_courses/tags/${course_id}`);
      setAllowedTags(data.tags);
      setChangingTagFor(offering_id);
      setNewTag("");
      setError("");
    } catch (e) {
      console.error("Fetch tags error:", e);
      setError("Could not load tags.");
    }
  };

  const submitChangeTag = async (offering_id) => {
    if (!newTag) return;
    try {
      await api.put(`/register_courses/${offering_id}`, { new_tag: newTag });
      setChangingTagFor(null);
      setAllowedTags([]);
      setNewTag("");
      fetchStatus();
    } catch (e) {
      console.error("Change tag error:", e);
      setError("Could not change tag.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Registered Courses</h2>

      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="bg-gray-200">
            {["Course", "Credits", "Tag", "Status", "Waitlist Pos", "Actions"].map((h) => (
              <th key={h} className="border p-2 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentRegs.map((r) => (
            <tr key={r.offering_id}>
              <td className="border p-2">{r.course_name} ({r.course_id})</td>
              <td className="border p-2">{r.credits}</td>
              <td className="border p-2">{r.tag}</td>
              <td className="border p-2">
                {r.status === "registered" ? (
                  <span className="text-green-600">Registered</span>
                ) : (
                  <span className="text-orange-600">Waitlisted</span>
                )}
              </td>
              <td className="border p-2">
                {r.waitlist_pos && r.waitlist_total ? `${r.waitlist_pos}/${r.waitlist_total}` : "-"}
              </td>
              <td className="border p-2 space-y-2">
                {changingTagFor === r.offering_id ? (
                  <div className="space-y-2">
                    <select
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="border p-1 rounded w-full"
                    >
                      <option value="">Select new tag</option>
                      {allowedTags.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        className="text-green-600 underline"
                        onClick={() => submitChangeTag(r.offering_id)}
                        disabled={!newTag}
                      >
                        Confirm
                      </button>
                      <button
                        className="text-gray-600 underline"
                        onClick={() => {
                          setChangingTagFor(null);
                          setAllowedTags([]);
                          setNewTag("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      className="text-red-600 underline"
                      onClick={() => handleDrop(r.offering_id)}
                    >
                      Drop
                    </button>
                    <button
                      className="text-blue-600 underline ml-2"
                      onClick={() => startChangeTag(r.offering_id, r.course_id)}
                    >
                      Change Tag
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {currentRegs.length === 0 && (
            <tr>
              <td colSpan={6} className="p-4 text-center text-gray-500">
                No registrations yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="relative mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => HandleQuery(e.target.value)}
          placeholder="Search courses by code or name…"
          className="border p-2 w-full rounded"
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 bg-white border w-full mt-1 max-h-48 overflow-auto">
            {suggestions.map((c) => (
              <li
                key={c.course_id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => chooseSuggestion(c)}
              >
                {c.course_id}: {c.course_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {courseInfo && (
        <div className="bg-gray-50 p-4 rounded shadow mb-4">
          <h3 className="font-semibold mb-2">
            Register {courseInfo.course_name} ({courseInfo.course_id})
          </h3>
          <p><strong>Credits:</strong> {courseInfo.credits}</p>
          <div className="mt-2">
            <label className="block text-sm">Tag:</label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="border p-2 w-full rounded"
            >
              <option value="">Select tag</option>
              {tags.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleRegister}
            disabled={!selectedTag}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            Confirm Registration
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}

export default RegisterCourses;
