# bd (Beads) Quick Reference for babysu Project

## 🎯 What is bd?

bd is your project's **persistent memory system**. It tracks:
- All tasks and subtasks
- Agent coordination and progress
- Historical context across sessions
- Dependencies between work items
- Complete audit trail of all work

## 🚀 Essential Commands

### Creating Issues
```bash
# Create a new task/issue
bd create "Task title" --description "Detailed description" --labels label1,label2 --type task

# Types: task, bug, feature, epic, chore
bd create "Fix memory leak" --description "Fix leak in search component" --type bug --priority 0

# Priority: 0 (highest) to 4 (lowest), default is 2
```

### Viewing Issues
```bash
# List all open issues
bd list

# List with filters
bd list --status open
bd list --status closed
bd list --labels bug,urgent
bd list --type feature

# Show full details of an issue
bd show babysu-XXXX

# Show statistics
bd stats
```

### Updating Issues
```bash
# Add progress comments (USE THIS FREQUENTLY)
bd comments add babysu-XXXX "Checkpoint: completed step X"

# View comments on an issue
bd comments babysu-XXXX

# Update issue description
bd update babysu-XXXX --description "Updated description"

# Add labels
bd update babysu-XXXX --labels new-label
```

### Managing Dependencies
```bash
# Link child task to parent
bd dep add PARENT-ID CHILD-ID

# Example: Make babysu-f166 block babysu-7ae8
bd dep add babysu-7ae8 babysu-f166

# View dependencies in: bd show babysu-XXXX
```

### Closing Issues
```bash
# Close when task is complete
bd close babysu-XXXX --reason "Task completed successfully"

# Close multiple issues
bd close babysu-XXXX babysu-YYYY --reason "Batch completion"
```

### System Commands
```bash
# Health check
bd doctor

# Statistics overview
bd stats

# Database information
bd info

# Find blocked issues
bd blocked

# Find ready issues (no blockers)
bd ready

# Find stale issues (not updated recently)
bd stale
```

## 🤖 Agent Workflow (MANDATORY)

Every agent MUST follow this pattern:

### 1. Start Task
```bash
# Check your assigned issue
bd show babysu-XXXX

# Add start comment
bd comments add babysu-XXXX "Starting work on [task name]"
```

### 2. Work & Track Progress
```bash
# Add checkpoint comments every 3-5 minutes
bd comments add babysu-XXXX "Checkpoint: Research complete"
bd comments add babysu-XXXX "Checkpoint: Implementation 50% done"
bd comments add babysu-XXXX "Checkpoint: Tests passing"
```

### 3. Handle Blockers
```bash
# If blocked, add blocker label and comment
bd update babysu-XXXX --labels blocked
bd comments add babysu-XXXX "BLOCKER: Missing API credentials"
```

### 4. Complete Task
```bash
# Close issue with summary
bd close babysu-XXXX --reason "Completed: [summary of work done]"
```

## 📊 Current Project Status

### Database Location
- **Local DB**: `/data/data/com.termux/files/home/proj/babysu/.beads/beads.db`
- **Issue Prefix**: `babysu` (issues named: babysu-XXXX)

### Quick Status Check
```bash
cd /data/data/com.termux/files/home/proj/babysu
bd stats
bd list
```

## 🎯 Use Cases

### For Orchestrator Agent
```bash
# 1. Create parent issue for user request
bd create "User Request: Add feature X" --description "Details..." --labels orchestrator

# 2. Create subtasks
bd create "Subtask: Research patterns" --labels agent:researcher
bd create "Subtask: Implement UI" --labels agent:frontend

# 3. Link dependencies
bd dep add PARENT-ID SUBTASK-ID

# 4. Monitor progress
bd list --status open
bd show ISSUE-ID

# 5. Close when complete
bd close PARENT-ID --reason "All subtasks completed"
```

### For Specialized Agents
```bash
# 1. Get task from orchestrator
bd show YOUR-ISSUE-ID

# 2. Add progress comments
bd comments add YOUR-ISSUE-ID "Checkpoint: [milestone]"

# 3. Complete task
bd close YOUR-ISSUE-ID --reason "[completion summary]"
```

## 💡 Tips

1. **Update Often**: Add comments at every checkpoint (minimum every 3-5 minutes)
2. **Be Specific**: Use clear titles and detailed descriptions
3. **Use Labels**: Tag issues with relevant labels (agent:name, feature, bug, etc.)
4. **Link Dependencies**: Always link related issues with `bd dep add`
5. **Check Stats**: Use `bd stats` to get overview
6. **Never Skip**: NEVER work on tasks without bd tracking

## 🔗 Quick Links

- Check health: `bd doctor`
- View all issues: `bd list`
- View stats: `bd stats`
- Get help: `bd help`
- Command help: `bd [command] --help`

## 🌟 Example Workflow

```bash
# User requests: "Add dark mode toggle"
# Orchestrator creates parent issue
bd create "User Request: Add dark mode toggle" --description "User wants dark/light theme switching" --labels orchestrator
# Output: Created babysu-a1b2

# Create subtasks
bd create "Research dark mode patterns" --labels agent:researcher --type task
# Output: Created babysu-c3d4
bd create "Implement dark mode UI" --labels agent:frontend --type feature
# Output: Created babysu-e5f6

# Link them
bd dep add babysu-a1b2 babysu-c3d4
bd dep add babysu-a1b2 babysu-e5f6

# Researcher agent works
bd comments add babysu-c3d4 "Checkpoint: Found React dark mode best practices"
bd close babysu-c3d4 --reason "Research complete. Recommended: CSS variables + localStorage"

# Frontend agent works
bd comments add babysu-e5f6 "Checkpoint: Added theme context"
bd comments add babysu-e5f6 "Checkpoint: Implemented toggle component"
bd close babysu-e5f6 --reason "Dark mode fully implemented and tested"

# Orchestrator closes parent
bd close babysu-a1b2 --reason "Dark mode feature complete. 2 agents coordinated."
```

## 📝 Notes

- bd version: 0.21.2
- Database initialized: 2025-11-04
- Current issues: Check with `bd list`
- Health status: Check with `bd doctor`

---

**Remember**: bd is your project memory. Use it religiously!
