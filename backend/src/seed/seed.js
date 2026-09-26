import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import { User, Project, TeamMember, Task, Comment, Issue, File, Activity, Notification } from '../models/index.js';

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(10, 0, 0, 0);
  return date;
};

const daysAgo = (days) => daysFromNow(-days);

async function seed() {
  // Never wipe or insert demo data in production, even if this file is run manually.
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed while NODE_ENV=production');
  }

  if (mongoose.connection.readyState === 0) {
    await connectDb();
  }
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    TeamMember.deleteMany({}),
    Task.deleteMany({}),
    Comment.deleteMany({}),
    Issue.deleteMany({}),
    File.deleteMany({}),
    Activity.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const users = await User.create([
    {
      name: 'Sri',
      email: 'admin@example.com',
      password: 'Password123!',
      role: 'admin',
      title: 'Engineering Manager',
      avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Sri&backgroundColor=6366f1',
      status: 'active',
    },
    {
      name: 'Leena',
      email: 'developer@example.com',
      password: 'Password123!',
      role: 'developer',
      title: 'Frontend Developer',
      avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Leena&backgroundColor=3b82f6',
      status: 'active',
    },
    {
      name: 'Teena',
      email: 'teena@example.com',
      password: 'Password123!',
      role: 'developer',
      title: 'Backend Developer',
      avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Teena&backgroundColor=10b981',
      status: 'active',
    },
    {
      name: 'John',
      email: 'john@example.com',
      password: 'Password123!',
      role: 'developer',
      title: 'Product Designer',
      avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=John&backgroundColor=f59e0b',
      status: 'active',
    },
    {
      name: 'Priya',
      email: 'priya@example.com',
      password: 'Password123!',
      role: 'developer',
      title: 'QA Engineer',
      avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Priya&backgroundColor=ec4899',
      status: 'active',
    },
    {
      name: 'Sam',
      email: 'sam@example.com',
      password: 'Password123!',
      role: 'developer',
      title: 'Backend Developer',
      avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Sam&backgroundColor=8b5cf6',
      status: 'away',
    },
    {
      name: 'Alex',
      email: 'alex@example.com',
      password: 'Password123!',
      role: 'developer',
      title: 'Frontend Developer',
      avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Alex&backgroundColor=14b8a6',
      status: 'active',
    },
    {
      name: 'Jane',
      email: 'jane@example.com',
      password: 'Password123!',
      role: 'developer',
      title: 'DevOps Engineer',
      avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Jane&backgroundColor=ef4444',
      status: 'offline',
    },
  ]);

  const [sri, leena, teena, john, priya, sam, alex, jane] = users;

  const projects = await Project.create([
    {
      name: 'Samba Academy Platform',
      description: 'Partner management platform for onboarding academies, tracking MDF, and reporting program health.',
      category: 'Product',
      owner: sri._id,
      status: 'On Track',
      startDate: daysAgo(60),
      targetDate: daysFromNow(45),
      progress: 82,
      color: '#6366F1',
    },
    {
      name: 'Corporate Website Revamp',
      description: 'Redesign the public marketing site with a new brand system, careers pages, and localization.',
      category: 'Marketing',
      owner: john._id,
      status: 'At Risk',
      startDate: daysAgo(40),
      targetDate: daysFromNow(20),
      progress: 54,
      color: '#F59E0B',
    },
    {
      name: 'CMS Migration',
      description: 'Move legacy content into the new CMS, rebuild templates, and train editors.',
      category: 'Platform',
      owner: teena._id,
      status: 'In Progress',
      startDate: daysAgo(25),
      targetDate: daysFromNow(50),
      progress: 38,
      color: '#3B82F6',
    },
    {
      name: 'Internal Portal',
      description: 'Employee portal for policies, leave, announcements, and team directories.',
      category: 'Internal',
      owner: sri._id,
      status: 'Planning',
      startDate: daysAgo(10),
      targetDate: daysFromNow(70),
      progress: 18,
      color: '#10B981',
    },
  ]);

  const [samba, website, cms, portal] = projects;

  const memberships = [
    [samba, sri, 'Owner'],
    [samba, leena, 'Developer'],
    [samba, teena, 'Lead'],
    [samba, john, 'Designer'],
    [samba, priya, 'QA'],
    [website, john, 'Owner'],
    [website, alex, 'Developer'],
    [website, sri, 'Lead'],
    [website, priya, 'QA'],
    [cms, teena, 'Owner'],
    [cms, sam, 'Developer'],
    [cms, leena, 'Developer'],
    [cms, jane, 'Developer'],
    [portal, sri, 'Owner'],
    [portal, alex, 'Developer'],
    [portal, jane, 'Developer'],
    [portal, sam, 'Developer'],
  ];

  await TeamMember.insertMany(
    memberships.map(([project, user, projectRole]) => ({
      project: project._id,
      user: user._id,
      projectRole,
    })),
  );

  const taskDefs = [
    ['Samba Academy login and SSO', samba, leena, 'Done', 'High', -20, -12, 'Authentication', ['Create layout', 'API integration']],
    ['Partner onboarding wizard', samba, alex, 'Done', 'High', -18, -8, 'Partner Module', ['Form validation', 'Responsive implementation']],
    ['MDF request dashboard', samba, sri, 'Review', 'Urgent', -5, 0, 'MDF', ['Add filters', 'Export CSV']],
    ['Academy directory filters', samba, leena, 'In Progress', 'High', -4, 1, 'Partner Module', ['Search', 'Pagination']],
    ['Program health reports', samba, teena, 'In Progress', 'Medium', -3, 4, 'Reporting', ['Chart widgets']],
    ['Role-based partner access', samba, sam, 'To Do', 'High', 1, 8, 'Authentication', []],
    ['MDF approval workflow', samba, teena, 'To Do', 'Urgent', 2, 10, 'MDF', ['Email alerts']],
    ['Mobile partner checklist', samba, john, 'Review', 'Medium', -2, 2, 'Responsive Work', []],
    ['API testing for partner module', samba, priya, 'In Progress', 'High', -1, 3, 'Testing', []],
    ['Launch checklist and go-live plan', samba, sri, 'To Do', 'Medium', 12, 20, 'Launch', []],
    ['Homepage hero redesign', website, john, 'Done', 'High', -15, -6, 'Brand', []],
    ['Careers listing page', website, alex, 'In Progress', 'Medium', -4, 2, 'Pages', ['Add filters']],
    ['Localization for EN and HI', website, leena, 'To Do', 'Medium', 3, 12, 'Content', []],
    ['SEO metadata audit', website, priya, 'Review', 'Low', -1, 1, 'Launch', []],
    ['Image compression pipeline', website, jane, 'To Do', 'High', 0, 6, 'Performance', []],
    ['Footer legal pages', website, alex, 'Done', 'Low', -10, -3, 'Pages', []],
    ['Brand token documentation', website, john, 'In Progress', 'Medium', -2, 5, 'Brand', []],
    ['Content model mapping', cms, teena, 'Done', 'High', -12, -4, 'Project Setup', []],
    ['Legacy article importer', cms, sam, 'In Progress', 'Urgent', -6, 3, 'Migration', ['Retry failed rows']],
    ['Editor training guide', cms, sri, 'To Do', 'Low', 8, 16, 'Launch', []],
    ['Template rebuild for news', cms, leena, 'Review', 'High', -2, 4, 'Templates', []],
    ['Media library cleanup', cms, jane, 'To Do', 'Medium', 2, 9, 'Migration', []],
    ['Preview environment setup', cms, jane, 'In Progress', 'High', -3, 2, 'Project Setup', []],
    ['Redirect map for old URLs', cms, teena, 'To Do', 'High', 5, 14, 'Launch', []],
    ['Policy document library', portal, alex, 'In Progress', 'Medium', -2, 6, 'Content', []],
    ['Leave request form', portal, leena, 'To Do', 'High', 4, 12, 'HR', ['API integration']],
    ['Team directory search', portal, sam, 'To Do', 'Medium', 6, 15, 'Directory', ['Add filters']],
    ['Announcement composer', portal, sri, 'Review', 'Low', -1, 3, 'Content', []],
    ['Single sign-on for portal', portal, teena, 'To Do', 'Urgent', 7, 18, 'Authentication', []],
    ['Mobile navigation polish', portal, john, 'In Progress', 'Medium', 0, 5, 'Responsive Work', []],
    ['Accessibility audit for portal', portal, priya, 'To Do', 'High', 8, 16, 'Testing', []],
    ['Deploy staging pipeline', portal, jane, 'Done', 'High', -8, -2, 'Project Setup', []],
  ];

  const tasks = await Task.insertMany(
    taskDefs.map(([title, project, assignee, status, priority, start, due, phase, subtasks], index) => ({
      title,
      description: `${title} for ${project.name}. Keep the work scoped to this milestone and update status as you go.`,
      project: project._id,
      assignee: assignee._id,
      status,
      priority,
      startDate: daysFromNow(start),
      dueDate: daysFromNow(due),
      labels: [phase, priority],
      phase,
      order: index,
      subtasks: subtasks.map((item) => ({ title: item, done: status === 'Done' })),
    })),
  );

  const taskByTitle = Object.fromEntries(tasks.map((task) => [task.title, task]));

  await Comment.insertMany([
    {
      task: taskByTitle['MDF request dashboard']._id,
      author: teena._id,
      body: 'The export currently misses rejected requests. I will patch the query today.',
    },
    {
      task: taskByTitle['MDF request dashboard']._id,
      author: sri._id,
      body: 'Please keep the filters aligned with the partner directory so the two views feel consistent.',
    },
    {
      task: taskByTitle['Academy directory filters']._id,
      author: leena._id,
      body: 'Region and program type filters are in. Still wiring the saved-view toggle.',
    },
    {
      task: taskByTitle['Legacy article importer']._id,
      author: sam._id,
      body: 'About 120 articles failed on missing authors. I am mapping them to the editorial desk account.',
    },
    {
      task: taskByTitle['Careers listing page']._id,
      author: john._id,
      body: 'Use the compact card on tablet and keep the department chips sticky.',
    },
  ]);

  await Issue.insertMany([
    {
      title: 'SSO callback fails for academy admins',
      description: 'Partner admins using the school domain are sent back to login after consent.',
      project: samba._id,
      assignee: sam._id,
      status: 'In Progress',
      priority: 'Critical',
      dueDate: daysFromNow(2),
    },
    {
      title: 'MDF budget totals drift after currency change',
      description: 'Switching a program from INR to USD leaves the previous total in the summary card.',
      project: samba._id,
      assignee: teena._id,
      status: 'Open',
      priority: 'High',
      dueDate: daysFromNow(5),
    },
    {
      title: 'Careers page images overflow on 375px',
      description: 'Hero crop does not respect the mobile breakpoint and covers the apply button.',
      project: website._id,
      assignee: alex._id,
      status: 'In Progress',
      priority: 'High',
      dueDate: daysFromNow(1),
    },
    {
      title: 'Lighthouse accessibility score below 80',
      description: 'Missing labels on the newsletter form and low contrast on secondary buttons.',
      project: website._id,
      assignee: priya._id,
      status: 'Waiting',
      priority: 'Medium',
      dueDate: daysFromNow(8),
    },
    {
      title: 'Importer skips articles with HTML tables',
      description: 'Legacy news posts that contain tables are dropped without a warning.',
      project: cms._id,
      assignee: sam._id,
      status: 'Open',
      priority: 'High',
      dueDate: daysFromNow(4),
    },
    {
      title: 'Preview environment SSL warning',
      description: 'Editors see a certificate warning when opening draft previews.',
      project: cms._id,
      assignee: jane._id,
      status: 'Resolved',
      priority: 'Medium',
      dueDate: daysAgo(1),
    },
    {
      title: 'Leave form does not persist drafts',
      description: 'Refreshing the page clears the selected dates and reason.',
      project: portal._id,
      assignee: leena._id,
      status: 'Open',
      priority: 'Medium',
      dueDate: daysFromNow(9),
    },
    {
      title: 'Directory search ignores middle names',
      description: 'Searching “Smith” does not return Teena.',
      project: portal._id,
      assignee: sam._id,
      status: 'Closed',
      priority: 'Low',
      dueDate: daysAgo(3),
    },
    {
      title: 'Staging deploy fails on missing env key',
      description: 'The portal pipeline looks for VITE_MAPS_KEY which is unused.',
      project: portal._id,
      assignee: jane._id,
      status: 'In Progress',
      priority: 'Critical',
      dueDate: daysFromNow(0),
    },
  ]);

  await File.insertMany([
    {
      name: 'mdf-requirements.pdf',
      originalName: 'MDF Requirements.pdf',
      type: 'application/pdf',
      size: 482112,
      path: 'seed/mdf-requirements.pdf',
      project: samba._id,
      uploadedBy: sri._id,
    },
    {
      name: 'partner-wireframes.fig',
      originalName: 'Partner Wireframes.fig',
      type: 'application/octet-stream',
      size: 1204224,
      project: samba._id,
      path: 'seed/partner-wireframes.fig',
      uploadedBy: john._id,
    },
    {
      name: 'brand-guidelines.pdf',
      originalName: 'Brand Guidelines.pdf',
      type: 'application/pdf',
      size: 890112,
      path: 'seed/brand-guidelines.pdf',
      project: website._id,
      uploadedBy: john._id,
    },
    {
      name: 'redirect-map.csv',
      originalName: 'Redirect Map.csv',
      type: 'text/csv',
      size: 22144,
      path: 'seed/redirect-map.csv',
      project: cms._id,
      uploadedBy: teena._id,
    },
    {
      name: 'portal-ia.docx',
      originalName: 'Portal Information Architecture.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 156000,
      path: 'seed/portal-ia.docx',
      project: portal._id,
      uploadedBy: sri._id,
    },
  ]);

  const activityRows = [
    [sri, samba, 'moved', 'MDF request dashboard', 'moved', 0.1],
    [john, samba, 'completed', 'Authentication screens', 'completed', 0.4],
    [teena, samba, 'assigned API testing to Priya', 'API Testing', 'assigned', 0.8],
    [sri, samba, 'uploaded', 'MDF Requirements.pdf', 'uploaded', 1.2],
    [leena, samba, 'commented on', 'Academy directory filters', 'commented', 1.6],
    [priya, samba, 'updated', 'API testing for partner module', 'updated', 2],
    [alex, website, 'updated', 'Careers listing page', 'updated', 2.5],
    [john, website, 'completed', 'Homepage hero redesign', 'completed', 3],
    [priya, website, 'reported issue', 'Lighthouse accessibility score below 80', 'created', 3.4],
    [sam, cms, 'updated', 'Legacy article importer', 'updated', 4],
    [teena, cms, 'created task', 'Redirect map for old URLs', 'created', 4.5],
    [jane, cms, 'resolved issue', 'Preview environment SSL warning', 'completed', 5],
    [leena, cms, 'moved', 'Template rebuild for news', 'moved', 5.5],
    [sri, portal, 'created project', 'Internal Portal', 'created', 6],
    [alex, portal, 'updated', 'Policy document library', 'updated', 6.4],
    [jane, portal, 'completed', 'Deploy staging pipeline', 'completed', 7],
    [sam, portal, 'commented on', 'Team directory search', 'commented', 7.5],
    [john, portal, 'updated', 'Mobile navigation polish', 'updated', 8],
    [teena, samba, 'updated', 'Program health reports', 'updated', 8.5],
    [sri, website, 'assigned', 'Image compression pipeline', 'assigned', 9],
    [priya, samba, 'completed', 'Smoke tests for onboarding', 'completed', 10],
    [leena, portal, 'created task', 'Leave request form', 'created', 11],
  ];

  await Activity.insertMany(
    activityRows.map(([user, project, action, target, type, hoursAgo]) => ({
      user: user._id,
      project: project._id,
      action,
      target,
      type,
      createdAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
    })),
  );

  await Notification.insertMany([
    {
      user: sri._id,
      title: 'John completed Authentication screens',
      body: 'Samba Academy Platform',
      type: 'task',
      link: '/projects',
      read: false,
    },
    {
      user: sri._id,
      title: 'You were assigned MDF request dashboard',
      body: 'Due today',
      type: 'task',
      link: '/my-tasks',
      read: false,
    },
    {
      user: sri._id,
      title: 'SSO callback issue is still open',
      body: 'Critical priority on Samba Academy Platform',
      type: 'issue',
      link: '/projects',
      read: false,
    },
    {
      user: sri._id,
      title: 'New project created',
      body: 'Internal Portal is now in planning',
      type: 'project',
      link: '/projects',
      read: true,
    },
    {
      user: leena._id,
      title: 'You were assigned Academy directory filters',
      body: 'Due tomorrow',
      type: 'task',
      read: false,
    },
    {
      user: leena._id,
      title: 'Sri commented on MDF request dashboard',
      body: 'Please keep the filters aligned with the partner directory.',
      type: 'comment',
      read: false,
    },
    {
      user: leena._id,
      title: 'Leave form issue assigned to you',
      body: 'Internal Portal',
      type: 'issue',
      read: true,
    },
    {
      user: sri._id,
      title: 'Priya moved API testing to In Progress',
      body: 'Samba Academy Platform',
      type: 'task',
      read: true,
    },
    {
      user: sri._id,
      title: 'Teena uploaded Redirect Map.csv',
      body: 'CMS Migration',
      type: 'file',
      read: true,
    },
    {
      user: sri._id,
      title: 'Careers page images overflow on 375px',
      body: 'High priority issue on Corporate Website Revamp',
      type: 'issue',
      read: false,
    },
    {
      user: sri._id,
      title: 'Weekly workload summary is ready',
      body: '3 tasks due this week across your projects',
      type: 'info',
      read: true,
    },
  ]);

  const taskCounts = await Task.aggregate([{ $group: { _id: '$project', total: { $sum: 1 }, done: { $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] } } } }]);
  await Promise.all(
    taskCounts.map((row) =>
      Project.findByIdAndUpdate(row._id, { progress: Math.round((row.done / row.total) * 100) }),
    ),
  );

  console.log('Seed complete');
  console.log('Admin: admin@example.com / Password123!');
  console.log('Developer: developer@example.com / Password123!');
}

const isDirectRun = process.argv[1] && process.argv[1].includes('seed.js');
if (isDirectRun) {
  seed()
    .then(() => mongoose.disconnect())
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seed };
