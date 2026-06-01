from __future__ import annotations
from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from app.models.base import IdTimestampMixin

class AppSetting(IdTimestampMixin, Base):
    __tablename__ = "app_settings"
    key: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    value_json: Mapped[str | None] = mapped_column(Text, nullable=True)

class SecurityPolicy(IdTimestampMixin, Base):
    __tablename__ = "security_policies"
    name: Mapped[str] = mapped_column(String(160), index=True)
    policy_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

class Skill(IdTimestampMixin, Base):
    __tablename__ = "skills"
    name: Mapped[str] = mapped_column(String(160), index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    config_json: Mapped[str | None] = mapped_column(Text, nullable=True)

class MCPServer(IdTimestampMixin, Base):
    __tablename__ = "mcp_servers"
    name: Mapped[str] = mapped_column(String(160), index=True)
    command: Mapped[str | None] = mapped_column(Text, nullable=True)
    config_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)

class ProxyConfig(IdTimestampMixin, Base):
    __tablename__ = "proxy_configs"
    name: Mapped[str] = mapped_column(String(160), index=True)
    proxy_url: Mapped[str | None] = mapped_column(String(800), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)

class GitConfig(IdTimestampMixin, Base):
    __tablename__ = "git_configs"
    name: Mapped[str] = mapped_column(String(160), index=True)
    remote_url: Mapped[str | None] = mapped_column(String(800), nullable=True)
    default_branch: Mapped[str] = mapped_column(String(80), default="main")

class ServerConfig(IdTimestampMixin, Base):
    __tablename__ = "server_configs"
    name: Mapped[str] = mapped_column(String(160), index=True)
    host: Mapped[str | None] = mapped_column(String(300), nullable=True)
    config_json: Mapped[str | None] = mapped_column(Text, nullable=True)
