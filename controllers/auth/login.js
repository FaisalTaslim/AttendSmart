const bcrypt = require("bcrypt");
const Org = require("../../models/users/organization");

exports.login = async (req, res) => {
    try {
        const { code, userRole, password } = req.body;

        if (!code || !userRole || !password) {
            return res.render("index", {
                popupMessage: "All fields are required",
                popupType: "error",
            });
        }

        if (userRole === "Org") {

            const org = await Org.findOne({
                code,
                isDeleted: false,
                isSuspended: false
            });

            if (!org) {
                return res.render("index", {
                    popupMessage: "Invalid organization code or password",
                    popupType: "error",
                });
            }

            if (org.verification.status !== "verified") {
                return res.render("index", {
                    popupMessage: "Organization is not verified yet",
                    popupType: "error",
                });
            }

            const admin = org.admin[0];

            const match = await bcrypt.compare(password, admin.password);
            if (!match) {
                return res.render("index", {
                    popupMessage: "Invalid organization code or password",
                    popupType: "error",
                });
            }

            req.session.user = {
                code: org.code,
                name: admin.name,
                role: "admin"
            };

            return res.redirect("/dashboard/admin");
        }

        // ---------- OTHER ROLES (later) ----------
        return res.render("index", {
            popupMessage: "This role login is not implemented yet",
            popupType: "error",
        });

    } catch (err) {
        console.error("Login error:", err);
        return res.render("index", {
            popupMessage: "Something went wrong during login",
            popupType: "error",
        });
    }
};