import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast as hotToast } from "react-hot-toast";
import AppSidebar from "../layout/AppSidebar";
import useBoardStore from "../../store/useBoardStore";
import apiClient from "../../api/client";
import "./Dashboard.css";

const BOARD_GRADIENTS = [
  "linear-gradient(135deg, #0079bf, #0c66e4)",
  "linear-gradient(135deg, #d29034, #e6a530)",
  "linear-gradient(135deg, #519839, #4bce97)",
  "linear-gradient(135deg, #b04632, #e74c3c)",
  "linear-gradient(135deg, #89609e, #c377e0)",
  "linear-gradient(135deg, #cd5a91, #ff78cb)",
  "linear-gradient(135deg, #00aecc, #6cc3e0)",
  "linear-gradient(135deg, #838c91, #a9abaf)",
];

const RECENT_TEMPLATES = [
  {
    id: "tmp-1",
    title: "My Tasks | Trello",
    subtitle: "Trello Templates",
    isTemplate: true,
    gradient: "linear-gradient(135deg, #f87168, #fea362)",
  },
  {
    id: "tmp-2",
    title: "Design Sprint",
    subtitle: "Trello Templates",
    isTemplate: true,
    gradient: "linear-gradient(135deg, #579dff, #0c66e4)",
  },
  {
    id: "tmp-3",
    title: "Freelance Branding Project",
    subtitle: "Trello Templates",
    isTemplate: true,
    gradient: "linear-gradient(135deg, #89609e, #c377e0)",
  },
];

const HomePage = ({
  boards,
  onBoardsLoaded,
  isSidebarOpen,
  setSidebarOpen,
}) => {
  const navigate = useNavigate();
  const { setCreateBoardModalOpen } = useBoardStore();
  const [showHeroCard, setShowHeroCard] = useState(true);
  const getGradient = (i) => BOARD_GRADIENTS[i % BOARD_GRADIENTS.length];

  const recentBoardsMapped = [...boards]
    .reverse()
    .slice(0, 4)
    .map((b, i) => ({
      id: b.id,
      title: b.title,
      subtitle: "Trello Workspace",
      isTemplate: false,
      gradient: getGradient(i),
      isReal: true,
    }));

  const templatesNeeded = Math.max(0, 4 - recentBoardsMapped.length);

  const recentlyViewed = [
    ...recentBoardsMapped,
    ...RECENT_TEMPLATES.slice(0, templatesNeeded),
  ];

  const handleItemClick = async (item) => {
    if (item.isReal) {
      navigate(`/b/${item.id}`);
    } else if (item.isTemplate) {
      try {
        hotToast(`Creating board from "${item.title}"...`);
        const res = await apiClient.post("/boards", { title: item.title });
        const newBoard = res.data.data;
        onBoardsLoaded((prev) => [...prev, newBoard]);
        setTimeout(() => navigate(`/b/${newBoard.id}`), 600);
      } catch {
        hotToast("Could not create board from template.");
      }
    } else {
      hotToast("Mock item clicked. Create a real board to see it here!");
    }
  };

  return (
    <div className="dashboard-layout">
      <AppSidebar
        boards={boards}
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div
        className="dashboard-content"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          paddingTop: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "48px",
            width: "100%",
            maxWidth: "1100px",
            padding: "0 24px",
          }}
        >
          {/* LEFT COLUMN: Hero Card */}
          {showHeroCard && (
            <div style={{ flex: "1 1 600px", maxWidth: "700px" }}>
              <div
                style={{
                  backgroundColor: "#22272b",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                {/* Card Banner Image Area */}
                <div
                  style={{
                    height: "240px",
                    backgroundColor: "#2b233a",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-end",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: "320px",
                      height: "200px",
                      backgroundColor: "#e9d7f8",
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Abstract UI representation */}
                    <div
                      style={{
                        position: "absolute",
                        top: "24px",
                        left: "24px",
                        right: "24px",
                        bottom: "0",
                        backgroundColor: "#cd93f5",
                        borderRadius: "8px 8px 0 0",
                        display: "flex",
                        gap: "16px",
                        padding: "16px",
                      }}
                    >
                      <div
                        style={{
                          width: "80px",
                          height: "100%",
                          backgroundColor: "#fff",
                          borderRadius: "6px",
                          opacity: 0.9,
                          padding: "8px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            height: "8px",
                            width: "40px",
                            backgroundColor: "#dfe1e6",
                            borderRadius: "4px",
                          }}
                        ></div>
                        <div
                          style={{
                            height: "24px",
                            width: "100%",
                            backgroundColor: "#dfe1e6",
                            borderRadius: "4px",
                          }}
                        ></div>
                        <div
                          style={{
                            height: "24px",
                            width: "100%",
                            backgroundColor: "#dfe1e6",
                            borderRadius: "4px",
                          }}
                        ></div>
                      </div>
                      <div
                        style={{
                          width: "80px",
                          height: "100%",
                          backgroundColor: "#fff",
                          borderRadius: "6px",
                          opacity: 0.9,
                          padding: "8px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            height: "8px",
                            width: "40px",
                            backgroundColor: "#dfe1e6",
                            borderRadius: "4px",
                          }}
                        ></div>
                        <div
                          style={{
                            height: "24px",
                            width: "100%",
                            backgroundColor: "#dfe1e6",
                            borderRadius: "4px",
                          }}
                        ></div>
                      </div>
                    </div>
                    {/* Floating abstract card */}
                    <div
                      style={{
                        position: "absolute",
                        top: "40px",
                        right: "20px",
                        width: "100px",
                        height: "120px",
                        backgroundColor: "#fff",
                        borderRadius: "6px",
                        boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                        transform: "rotate(10deg)",
                        padding: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          height: "60px",
                          backgroundColor: "#4bce97",
                          borderRadius: "4px",
                        }}
                      ></div>
                      <div
                        style={{
                          height: "8px",
                          width: "60%",
                          backgroundColor: "#dfe1e6",
                          borderRadius: "4px",
                        }}
                      ></div>
                      <div
                        style={{
                          height: "8px",
                          width: "80%",
                          backgroundColor: "#dfe1e6",
                          borderRadius: "4px",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: "32px 48px", textAlign: "center" }}>
                  <h2
                    style={{
                      color: "#fff",
                      fontSize: "20px",
                      margin: "0 0 16px",
                      fontWeight: "600",
                    }}
                  >
                    Organize anything
                  </h2>
                  <p
                    style={{
                      color: "#b6c2cf",
                      fontSize: "14px",
                      lineHeight: "20px",
                      margin: "0 0 24px",
                      padding: "0 20px",
                    }}
                  >
                    Put everything in one place and start moving things forward
                    with your first Trello board!
                  </p>
                  <button
                    onClick={() => setCreateBoardModalOpen(true)}
                    style={{
                      backgroundColor: "#579dff",
                      color: "#1d2125",
                      border: "none",
                      borderRadius: "3px",
                      padding: "8px 16px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      marginBottom: "16px",
                    }}
                  >
                    Create a Workspace board
                  </button>
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowHeroCard(false)}
                      style={{
                        color: "#b6c2cf",
                        fontSize: "14px",
                        textDecoration: "underline",
                        cursor: "pointer",
                        background: "none",
                        border: "none",
                        padding: 0,
                      }}
                    >
                      Got it! Dismiss this.
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RIGHT COLUMN: Sidebar Links */}
          <div
            style={{
              flex: "0 0 320px",
              display: "flex",
              flexDirection: "column",
              gap: "32px",
            }}
          >
            {/* Recently Viewed */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                  color: "#9fadbc",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                </svg>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  Recently viewed
                </span>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {recentlyViewed.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "8px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "rgba(255,255,255,0.06)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "32px",
                        borderRadius: "4px",
                        background: item.gradient,
                        flexShrink: 0,
                      }}
                    ></div>
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: "#fff",
                          fontSize: "14px",
                          fontWeight: "500",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          color: "#9fadbc",
                          fontSize: "12px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                    {item.isTemplate && (
                      <div
                        style={{
                          backgroundColor: "#2c333a",
                          color: "#9fadbc",
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 6px",
                          borderRadius: "3px",
                        }}
                      >
                        TEMPLATE
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#9fadbc",
                  marginBottom: "16px",
                  textTransform: "uppercase",
                }}
              >
                Links
              </div>
              <div
                onClick={() => setCreateBoardModalOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "8px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.06)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <div
                  style={{
                    width: "40px",
                    height: "32px",
                    borderRadius: "4px",
                    backgroundColor: "rgba(255,255,255,0.16)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                </div>
                <div
                  style={{ color: "#fff", fontSize: "14px", fontWeight: "500" }}
                >
                  Create new board
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
