# Backing up and restoring the appliance

From v0.1.0-rc.7 the appliance backs up the product's database on its own. The database archives
its changes to the box's encrypted backup partition as they happen, and takes a full base backup
every night at 01:15 UTC, keeping the last seven. This guide covers what you do on top of that:
cutting a named backup set, taking it off the box, and restoring it.

Backups stay on the box. Nothing is copied to another machine on a schedule yet, so a lost box
still depends on your escrow file and a migration export. A backup set
restores only on the box that made it.

## Before you start

- You're an admin on the appliance to cut a set. Exporting, restoring and removing a set are for
  owners, and each asks for a fresh authenticator code.
- You can reach the appliance over SSH as described in [Getting a support bundle](./support-bundle-guide.md).
- To open an export, you have one of the box's SSH recovery keys and the `age` tool
  on your machine.

## Cut a backup set

A set is a named restore point. Cut one before a change you may want to undo. The product keeps
running.

1. Cut the set:

   ```sh
   ssh admin@box1.example.org sneakers backup create before-the-change
   ```

   The box makes a restore point, waits for its log to reach the archive, and links the files into
   the set. If the archive has a gap, it takes a new base backup first.

2. List the sets:

   ```sh
   ssh admin@box1.example.org sneakers backup list
   ```

## Take a set off the box

An export is one file encrypted with age to the box's recovery keys, so nothing leaves in the clear
and any one recovery key opens it.

1. Export the set. Replace `123456` with a fresh code from your authenticator app:

   ```sh
   ssh owner@box1.example.org sneakers backup export before-the-change --code 123456 > before-the-change.age
   ```

2. Check that you can open it:

   ```sh
   age -d -i ~/.ssh/sneakers-recovery before-the-change.age | tar -tv
   ```

Reading an export back into a box isn't built yet.

## Restore a set

A restore puts the database back to the set's restore point. The product is offline while it runs,
and everything written after that point is gone once the box settles. Updates and the console show
the restore as a step.

1. Restore the set. The box asks you to type the set's name again and to give a fresh code:

   ```sh
   ssh owner@box1.example.org sneakers backup restore before-the-change
   ```

2. Wait for the product to come back. If any step fails, the box puts the data it had back and the
   product comes up on that. Status says why.

A restore is refused, with nothing changed, when:

- the set was made on a box with other keys (`BACKUP_OTHER_BOX`);
- the data volume can't hold the restored data beside the data it keeps (`BACKUP_ROOM`);
- an update or another restore is running, or the box hasn't settled after the database move
  (`BACKUP_BUSY`).

## Remove a set

```sh
ssh owner@box1.example.org sneakers backup remove before-the-change
```

The box never removes a set itself. A set holds the disk space of the files it links until you
remove it.

## When the backup partition fills up

A full backup partition warns and never stops the database. If the archive can't keep up, the box
lets the oldest waiting log files go, records the gap, and takes a new base backup once there is
room. A restore can't cross a gap. Status shows a warning for this, and for archiving that has
stood still for 15 minutes, a base backup that is missing, over 48 hours old or failed, and a
failed restore check.

## The database move at upgrade

The upgrade to rc.7 moves the product's databases to a new PostgreSQL cluster. The box dumps the old
cluster to the backup partition, restores into the new one, compares every table and runs the
product's own checks before the services start. It never writes to the old cluster, and a failed
move takes the box back to it.

Don't cut power during this upgrade or straight after it. A box can stay stuck if it loses power
right after the move
([sneakers-appliance#579](https://github.com/Sneakers-PAM/sneakers-appliance/issues/579)).
