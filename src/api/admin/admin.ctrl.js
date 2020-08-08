const crypto = require('crypto');
const { users, intros } = require('../../models');
const {
    userScheme,
    introNoScheme,
    introScheme,
    updateIntroScheme,
    permScheme,
    userNoScheme,
} = require('../../lib/schemes');

const isAdmin = async (email) => {
    const admin = await users.findOne({
        where: { email, state: 0, level: 999 },
    });
    return admin;
};

/**
 *  유저 정보를 읽어옴
 *  @route GET /api/admin/user
 *  @group Admin
 *  @returns {Array} 200 - 유저 리스트
 *  @returns {Error} NOT_ADMIN - NOT_ADMIN
 */
const getUser = async (req, res, next) => {
    try {
        const checkAdmin = await isAdmin(req.user.emails[0].value);
        if (!checkAdmin) throw new Error('NOT_ADMIN');

        // 관리자 API라 관리자, 탈퇴자 모두 반환하도록 함.
        const userList = await users.findAll();
        res.json({ userList });
    } catch (err) {
        next(err);
    }
};

/**
 * @typedef UserInfo
 * @property {string} userName.requierd
 * @property {string} email.required
 * @property {string} studentId.required
 */

/**
 *  유저 정보를 추가함
 *  @route POST /api/admin/users
 *  @group Admin
 *  @param {UserInfo.model} userInfo.body.required - 유저 정보
 *  @returns {object} 200 - 빈 객체
 *  @returns {Error} NOT_ADMIN - NOT_ADMIN
 *  @returns {Error} INVALID_PARAMETERS - INVALID_PARAMETERS
 */
const postUser = async (req, res, next) => {
    try {
        const checkAdmin = await isAdmin(req.user.emails[0].value);
        if (!checkAdmin) throw new Error('NOT_ADMIN');

        const { error, value } = userScheme.validate(req.body);
        if (error) throw new Error('INVALID_PARAMETERS');

        const { userName, email, studentId } = value;
        await users.create({
            userName,
            email,
            studentId,
            joinedAt: new Date(Date.now()),
            level: 1,
            state: 0,
        });

        res.json({});
    } catch (err) {
        next(err);
    }
};

/**
 * @typedef UserPermision
 * @property {number} userId.required
 * @property {number} level.required
 */

/**
 *  유저 권한을 설정함
 *  @route PUT /api/admin/user/permission
 *  @group Admin
 *  @param {UserPermission.model} userPermission.body.required - 유저 권한 정보
 *  @returns {object} 200 - 빈 객체
 *  @returns {Error} NOT_ADMIN - NOT_ADMIN
 *  @returns {Error} INVALID_PARAMETERS - INVALID_PARAMETERS
 */
const updateUserPermission = async (req, res, next) => {
    try {
        const checkAdmin = await isAdmin(req.user.emails[0].value);
        if (!checkAdmin) throw new Error('NOT_ADMIN');

        const { error, value } = permScheme.validate(req.body);
        if (error) throw new Error('INVALID_PARAMETERS');

        const { userId, level } = value;
        const user = await users.findOne({
            where: { userId, state: 0 },
        });
        if (!user) throw new Error('INVALID_PARAMETERS');

        await users.update({ level }, { where: { userId } });
        res.json({});
    } catch (err) {
        next(err);
    }
};

/**
 *  유저 삭제
 *  @route DELETE /api/admin/user/{userId}
 *  @group Admin
 *  @param {number} userId.required - 유저 넘버
 *  @returns {object} 200 - 빈 객체
 *  @returns {Error} NOT_ADMIN - NOT_ADMIN
 *  @returns {Error} INVALID_PARAMETERS - INVALID_PARAMETERS
 */
const deleteUser = async (req, res, next) => {
    try {
        const checkAdmin = await isAdmin(req.user.emails[0].value);
        if (!checkAdmin) throw new Error('NOT_ADMIN');

        const { error, value } = userIdScheme.validate(req.params.userId);
        if (error) throw new Error('INVALID_PARAMETERS');

        const { userId } = value;
        const user = await users.findOne({ where: { userId, state: 0 } });
        if (!user) throw new Error('INVALID_PARAMETERS');

        /* 삭제한 회원의 정보를 전부 해시 처리함 */
        const { userName, email, studentId } = user.dataValues;
        const hash = (msg) => {
            return crypto.createHash('sha256').update(msg).digest('hex');
        };
        await users.update(
            {
                userName: hash(userName),
                email: hash(email),
                studentId: hash(studentId),
                level: 0,
                state: 1,
            },
            { where: { userId } },
        );
        res.json({});
    } catch (err) {
        next(err);
    }
};

/**
 * 소개글 작성
 * @typedef Intro
 * @property {string} title.required - 제목
 * @property {string} content.required - 내용
 */

/**
 * 소개글 작성
 * @route POST /api/admin/intro
 * @group Admin
 * @param {Intro.model} intro.body.required - 소개 글
 * @returns {object} 200 - 빈 객체
 * @returns {Error} NOT_ADMIN - NOT_ADMIN
 * @returns {Error} INVALID_PARAMETERS - INVALID_PARAMETERS
 */
const postIntro = async (req, res, next) => {
    try {
        const checkAdmin = await isAdmin(req.user.emails[0].value);
        if (!checkAdmin) throw new Error('NOT_ADMIN');

        const { error, value } = introScheme.validate(req.body);
        if (error) throw new Error('INVALID_PARAMETERS');

        const { title, content } = value;

        await intros.create({ title, content });

        res.json({});
    } catch (err) {
        next(err);
    }
};

/**
 * 소개글 수정
 * @route PUT /api/admin/intro
 * @group Admin
 * @param {number} introId.path.required - 수정할 소개글 ID
 * @param {Intro.model} intro.body.required - 소개글 수정
 * @returns {object} 200 - 빈 객체
 * @returns {Error} NOT_ADMIN - NOT_ADMIN
 * @returns {Error} INVALID_PARAMETERS - INVALID_PARAMETERS
 */
const updateIntro = async (req, res, next) => {
    try {
        const checkAdmin = await isAdmin(req.user.emails[0].value);
        if (!checkAdmin) throw new Error('NOT_ADMIN');

        const { error, value } = updateIntroScheme.validate({
            ...req.body,
            introId: req.params.introId,
        });
        if (error) throw new Error('INVALID_PARAMETERS');

        const { introId, title, content } = value;
        const intro = await intros.findOne({ where: { introId } });
        if (!intro) throw new Error('INVALID_PARAMETERS');

        intro.title = title;
        intro.content = content;
        await intro.save();

        res.json({});
    } catch (err) {
        next(err);
    }
};

/**
 * 소개글 삭제
 * @route DELETE /api/admin/intro
 * @group Admin
 * @param {number} introId.path.required - 삭제할 소개글 ID
 * @returns {object} 200 - 빈 객체
 * @returns {Error} NOT_ADMIN - NOT_ADMIN
 * @returns {Error} INVALID_PARAMETERS - INVALID_PARAMETERS
 */
const deleteIntro = async (req, res, next) => {
    try {
        // TODO: 어드민 체크
        const checkAdmin = await isAdmin(req.user.emails[0].value);
        if (!checkAdmin) throw new Error('NOT_ADMIN');

        const { error, value } = introIdScheme.validate(req.params.introId);
        if (error) throw new Error('INVALID_PARAMETERS');

        const introId = value;
        const intro = await intros.findOne({ where: { introId } });
        if (!intro) throw new Error('INVALID_PARAMETERS');

        await intro.destroy();

        res.json({});
    } catch (err) {
        next(err);
    }
};

const postNotice = async (req, res, next) => {};
const putEditNotice = async (req, res, next) => {};
const deleteNotice = async (req, res, next) => {};

module.exports = {
    getUser,
    postUser,
    updateUserPermission,
    deleteUser,
    postNotice,
    putEditNotice,
    deleteNotice,
    postIntro,
    updateIntro,
    deleteIntro,
};
