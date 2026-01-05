FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY . /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter vinylstore build
# Deploy prod deps to a separate folder
RUN pnpm deploy --filter=vinylstore --prod /prod/backend --legacy

FROM base AS backend
COPY --from=build /prod/backend /app
# Copy the built artifacts from the build stage
COPY --from=build /app/apps/backend/dist /app/dist

EXPOSE 3000
CMD [ "node", "dist/main" ]
