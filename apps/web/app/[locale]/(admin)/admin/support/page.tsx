import React from 'react';
import {
  Shield,
  Database,
  Server,
  Bug,
  BookOpen,
  Users,
  Phone,
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const metadata = {
  title: 'Admin Support | Meru County Public Service Board',
  description: 'Technical support and resources for system administrators.',
};

export default function AdminSupportPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Support Center</h1>
        <p className="text-muted-foreground mt-2">
          Technical support, system resources, and administrator assistance
        </p>
      </div>

      {/* System Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatusCard
          icon={<Server className="h-5 w-5" />}
          title="API Services"
          status="operational"
          lastChecked="2 min ago"
        />
        <StatusCard
          icon={<Database className="h-5 w-5" />}
          title="Database"
          status="operational"
          lastChecked="5 min ago"
        />
        <StatusCard
          icon={<Shield className="h-5 w-5" />}
          title="Authentication"
          status="operational"
          lastChecked="1 min ago"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="bg-card rounded-xl border p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Quick Resources
          </h2>
          <div className="space-y-3">
            <ResourceLink
              href="/admin/reports"
              title="System Reports"
              description="View performance and usage analytics"
              icon={<BookOpen className="h-4 w-4" />}
            />
            <ResourceLink
              href="/admin/settings"
              title="System Settings"
              description="Configure application parameters"
              icon={<Shield className="h-4 w-4" />}
            />
            <ResourceLink
              href="/admin/board"
              title="Board Management"
              description="Manage board members and permissions"
              icon={<Users className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Contact Options */}
        <div className="bg-card rounded-xl border p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            Technical Support
          </h2>
          <div className="space-y-4">
            <ContactOption
              icon={<Mail className="h-4 w-4" />}
              label="Email Support"
              value="techsupport@merucpsb.go.ke"
              href="mailto:techsupport@merucpsb.go.ke"
              description="For technical issues and system inquiries"
            />
            <ContactOption
              icon={<MessageSquare className="h-4 w-4" />}
              label="Admin Slack Channel"
              value="#meru-cpsb-admins"
              href="#"
              description="Real-time collaboration with admins"
            />
            <ContactOption
              icon={<Phone className="h-4 w-4" />}
              label="Emergency Hotline"
              value="+254 700 000 000"
              href="tel:+254700000000"
              description="Critical system issues only"
            />
          </div>
        </div>
      </div>

      {/* Common Issues */}
      <div className="bg-card rounded-xl border p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Bug className="h-5 w-5 text-primary" />
          Common Admin Issues
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <IssueCard
            title="Application Status Updates"
            description="Bulk update application statuses and trigger notifications"
            severity="info"
          />
          <IssueCard
            title="Report Generation"
            description="Scheduled reports are generated daily at midnight"
            severity="success"
          />
          <IssueCard
            title="User Permission Errors"
            description="Verify board member roles in Settings > Board Management"
            severity="warning"
          />
          <IssueCard
            title="File Upload Limits"
            description="Max file size: 5MB. Allowed: PDF, JPEG, PNG"
            severity="info"
          />
          <IssueCard
            title="Database Sync Issues"
            description="Auto-sync runs every 15 minutes. Check status above."
            severity="success"
          />
          <IssueCard
            title="API Rate Limiting"
            description="Current limit: 1000 requests/min per admin user"
            severity="info"
          />
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Emergency Contacts
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="font-semibold">System Administrator</p>
            <p className="text-sm text-muted-foreground">+254 776 733 322</p>
          </div>
          <div>
            <p className="font-semibold">Database Administrator</p>
            <p className="text-sm text-muted-foreground">+254 776 733 323</p>
          </div>
          <div>
            <p className="font-semibold">Security Officer</p>
            <p className="text-sm text-muted-foreground">security@merucpsb.go.ke</p>
          </div>
          <div>
            <p className="font-semibold">ICT Director</p>
            <p className="text-sm text-muted-foreground">ict@meru.go.ke</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          * Available 24/7 for critical system outages and security incidents
        </p>
      </div>
    </div>
  );
}

function StatusCard({ icon, title, status, lastChecked }: {
  icon: React.ReactNode;
  title: string;
  status: 'operational' | 'degraded' | 'down';
  lastChecked: string;
}) {
  const statusConfig = {
    operational: { icon: CheckCircle2, color: 'text-green-500', label: 'Operational' },
    degraded: { icon: AlertTriangle, color: 'text-yellow-500', label: 'Degraded' },
    down: { icon: AlertTriangle, color: 'text-red-500', label: 'Down' },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold">{title}</span>
        </div>
        <StatusIcon className={`h-4 w-4 ${config.color}`} />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className={config.color}>{config.label}</span>
        <span className="text-muted-foreground">{lastChecked}</span>
      </div>
    </div>
  );
}

function ResourceLink({ href, title, description, icon }: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
    >
      <div className="mt-0.5 text-primary">{icon}</div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground" />
    </a>
  );
}

function ContactOption({ icon, label, value, href, description }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  description: string;
}) {
  return (
    <a href={href} className="block">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="font-semibold text-sm">{label}</span>
      </div>
      <p className="text-sm text-primary ml-6">{value}</p>
      <p className="text-xs text-muted-foreground ml-6 mt-1">{description}</p>
    </a>
  );
}

function IssueCard({ title, description, severity }: {
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'success';
}) {
  const severityConfig = {
    info: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500' },
    warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-500' },
    success: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-500' },
  };

  const config = severityConfig[severity];

  return (
    <div className={`p-4 rounded-lg border ${config.bg} ${config.border}`}>
      <p className="font-semibold text-sm mb-1">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
