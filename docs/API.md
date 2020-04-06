# API

1. 인증
    1. POST host/api/auth/login
        로그인
    2. POST host/api/auth/logout
        로그아웃
    3. POST host/api/auth/register
        가입
    4. POST host/api/auth/unregister
        탈퇴
    5. POST host/api/auth/find/id
        아이디 찾기
    6. POST host/api/auth/find/password
        비번 찾기
    7. POST host/api/auth/change/password
        비번 변경
2. 공지
    1. GET host/api/notice
        공지 전체보기
    2. GET host/api/notice/:notice_id
        공지 상세보기
    3. POST host/api/notice/:notice_id/comment
        공지 댓글 쓰기
    4. POST host/api/notice/:notice_id/comment/:comment_id
        공지 댓글 수정
    5. DELETE host/api/notice/:notice_id/comment/:comment_id
        공지 댓글 삭제
3. 게시판
    1. GET host/api/board
        게시판 전체보기
    2. GET host/api/board/:board_id
        게시판 상세보기
    3. POST host/api/board
        게시판 쓰기
    4. POST host/api/board/:board_id
        게시판 수정
    5. DELETE host/api/board/:board_id
        게시판 삭제
    6. POST host/api/board/:board_id/comment
        게시판 댓글 쓰기
    7. POST host/api/board/:board_id/comment/:comment_id
        게시판 댓글 수정
    8. DELETE host/api/notice/:notice_id/comment/:comment_id
        게시판 댓글 삭제
4. 아카이브
    당신 아카이브 ftp로 대체되었다
5. 검색
    1. POST host/api/search
6. 관리자
    1. GET host/api/admin/user
        사용자 리스트
    2. DELETE host/api/admin/user/:user_id
        사용자 삭제
    3. POST host/api/admin/user/:user_id/auth
        사용자 승인
    4. POST host/api/admin/notice
        공지 작성
    5. POST host/api/admin/notice/:notice_id
        공지 수정
    6. DELETE host/api/admin/notice/:notice_id
        공지 삭제
