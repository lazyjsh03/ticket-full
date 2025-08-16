#!/bin/sh

# 스크립트 실행 중 오류가 발생하면 즉시 중단되도록 설정
set -e

# Django가 DB에 연결할 수 있을 때까지 대기 (선택 사항이지만 안정성을 위해 추천)
# 여기서는 간단히 migrate만 실행합니다.

# 데이터베이스 마이그레이션을 적용합니다.
echo "Applying database migrations..."
python manage.py migrate --noinput

# 그 다음, Dockerfile이나 docker-compose.yml에서 전달된
# 원래의 메인 명령어(예: runserver)를 실행합니다.
exec "$@"