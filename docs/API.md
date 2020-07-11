# API

## 목차

- [인증](#인증)
- [공지](#공지)
- [게시판](#게시판)
- [아카이브](#아카이브)
- [검색](#검색)
- [관리자](#관리자)

## 인증

### POST host/api/auth/login

    로그인

### POST host/api/auth/logout

    로그아웃

### POST host/api/auth/register

    가입

### POST host/api/auth/unregister

    탈퇴

### POST host/api/auth/find/id

    아이디 찾기

### POST host/api/auth/find/password

    비번 찾기

### POST host/api/auth/change/password

    비번 변경

## 공지

### GET host/api/notice

    공지 전체보기

### GET host/api/notice/:notice_id

    공지 상세보기

### POST host/api/notice/:notice_id/comment

    공지 댓글 쓰기

### POST host/api/notice/:notice_id/comment/:comment_id

    공지 댓글 수정

### DELETE host/api/notice/:notice_id/comment/:comment_id

    공지 댓글 삭제

## 게시판

### GET host/api/board

    게시판 전체보기

### GET host/api/board/:board_id

    게시판 상세보기

### POST host/api/board

    게시판 쓰기

### POST host/api/board/:board_id

    게시판 수정

### DELETE host/api/board/:board_id

    게시판 삭제

### POST host/api/board/:board_id/comment

    게시판 댓글 쓰기

### POST host/api/board/:board_id/comment/:comment_id

    게시판 댓글 수정

### DELETE host/api/board/:board_id/comment/:comment_id

    게시판 댓글 삭제

## 아카이브

    당신 아카이브 ftp로 대체되었다

## 검색

### POST host/api/search

    검색

## 관리자

### GET host/api/admin/user

    사용자 리스트

### DELETE host/api/admin/user/:user_id

    사용자 삭제

### POST host/api/admin/user/:user_id/auth

    사용자 승인

### POST host/api/admin/notice

    공지 작성

### POST host/api/admin/notice/:notice_id

    공지 수정

### DELETE host/api/admin/notice/:notice_id

    공지 삭제
