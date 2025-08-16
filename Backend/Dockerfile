# Dockerfile

# 1. 베이스 이미지 설정
FROM python:3.11-slim

# 2. 환경 변수 설정
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 3. 작업 디렉토리 설정
WORKDIR /app

# 4. 시스템 패키지 설치 (mysqlclient 빌드에 필요한 pkg-config 추가)
RUN apt-get update && apt-get install -y build-essential default-libmysqlclient-dev pkg-config

# 5. uv 설치
RUN pip install uv

# 6. requirements.txt 복사 및 패키지 설치
COPY requirements.txt .
RUN uv pip install --system --no-cache-dir -r requirements.txt

# 7. 프로젝트 소스 코드 복사
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# 8. 컨테이너가 시작될 때 8000번 포트를 외부에 노출
EXPOSE 8000