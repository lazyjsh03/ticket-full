# Frontend/Dockerfile

# 1. 베이스 이미지로 Node.js 최신 LTS 버전(Alpine)을 사용합니다.
FROM node:22-alpine

# 2. 작업 디렉토리를 설정합니다.
WORKDIR /app

# 3. package.json과 yarn.lock을 먼저 복사하여 의존성을 설치합니다.
#    (소스코드가 바뀌어도 의존성은 재설치하지 않도록 캐싱 레이어를 활용)
COPY package.json yarn.lock ./
RUN yarn install

# 4. 나머지 모든 소스 코드를 복사합니다.
COPY . .

# 5. Vite 개발 서버의 기본 포트인 5173번을 노출합니다.
EXPOSE 5173

# 6. 컨테이너가 시작될 때 실행할 기본 명령어를 설정합니다.
CMD ["yarn", "dev", "--host"]
