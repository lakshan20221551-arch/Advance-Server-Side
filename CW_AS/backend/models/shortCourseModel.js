const { sql, poolPromise } = require("../config/db");

class ShortCourseModel {
    static async getCourses(userId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("UserID", sql.Int, userId)
            .query("SELECT asv_course_id, asv_user_id, asv_name, asv_provider, asv_url, asv_completion_date FROM AAP_SHORTCOURSES_VIEW WHERE asv_user_id = @UserID");
        return result.recordset;
    }

    static async insertUpdateCourse(courseId, userId, name, provider, url, completionDate) {
        const pool = await poolPromise;
        await pool.request()
            .input("CourseID", sql.Int, courseId || 0)
            .input("UserID", sql.Int, userId)
            .input("Name", sql.VarChar(1000), name)
            .input("Provider", sql.VarChar(1000), provider)
            .input("Url", sql.VarChar(1000), url || null)
            .input("CompletionDate", sql.DateTime, completionDate || null)
            .execute("InsertUpdateShortCourseDetails");
    }

    static async deleteCourse(courseId, userId) {
        const pool = await poolPromise;
        await pool.request()
            .input("UserID", sql.Int, userId)
            .input("CourseID", sql.Int, courseId)
            .execute("DeleteShortCourseDetails");
    }
}
module.exports = ShortCourseModel;
