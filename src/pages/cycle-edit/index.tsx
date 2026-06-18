import React, { useState } from 'react';
import { View, Text, Button, Picker, ScrollView } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/appStore';
import { members } from '@/data/members';
import { courses } from '@/data/courses';
import { getWeekdayName } from '@/utils/date';
import type { CycleRule } from '@/types';
import styles from './index.module.scss';

const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const PLAYER_OPTIONS = ['1人', '2人', '3人', '4人'];

const CycleEditPage: React.FC = () => {
  const [editId, setEditId] = useState<string>('');
  const [memberIndex, setMemberIndex] = useState<number>(0);
  const [courseIndex, setCourseIndex] = useState<number>(0);
  const [weekday, setWeekday] = useState<number>(1);
  const [startTime, setStartTime] = useState<string>('07:00');
  const [endTime, setEndTime] = useState<string>('11:30');
  const [startDate, setStartDate] = useState<string>('2026-06-18');
  const [endDate, setEndDate] = useState<string>('2026-12-31');
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [error, setError] = useState<string>('');
  const [generateToDate, setGenerateToDate] = useState<string>('2026-07-31');
  const [generateResult, setGenerateResult] = useState<{
    success: number;
    skipped: string[];
    total: number;
  } | null>(null);

  const addCycleRule = useAppStore((s) => s.addCycleRule);
  const updateCycleRule = useAppStore((s) => s.updateCycleRule);
  const getCycleRuleById = useAppStore((s) => s.getCycleRuleById);
  const generateBookingsFromCycle = useAppStore((s) => s.generateBookingsFromCycle);

  useLoad((options) => {
    const id = (options as { id?: string })?.id;
    if (id) {
      setEditId(id);
      const rule = getCycleRuleById(id);
      if (rule) {
        const mIdx = Math.max(0, members.findIndex((m) => m.id === rule.memberId));
        const cIdx = Math.max(0, courses.findIndex((c) => c.id === rule.courseId));
        setMemberIndex(mIdx);
        setCourseIndex(cIdx);
        setWeekday(rule.weekday);
        setStartTime(rule.startTime);
        setEndTime(rule.endTime);
        setStartDate(rule.startDate);
        setEndDate(rule.endDate);
        setPlayerCount(rule.playerCount);
        Taro.setNavigationBarTitle({ title: '编辑周期规则' });
      } else {
        console.error('[Cycle] 未找到周期规则', id);
      }
    } else {
      Taro.setNavigationBarTitle({ title: '新增周期规则' });
    }
  });

  const validate = (): boolean => {
    if (!members[memberIndex]) {
      setError('请选择会员');
      return false;
    }
    if (!courses[courseIndex]) {
      setError('请选择球道');
      return false;
    }
    if (startTime >= endTime) {
      setError('开始时间需早于结束时间');
      return false;
    }
    if (startDate > endDate) {
      setError('开始日期需早于结束日期');
      return false;
    }
    setError('');
    return true;
  };

  const handleSave = () => {
    if (!validate()) {
      Taro.showToast({ title: error || '请检查表单', icon: 'none' });
      return;
    }
    const member = members[memberIndex];
    const course = courses[courseIndex];
    const payload: Omit<CycleRule, 'id' | 'generatedCount' | 'totalCount'> = {
      memberId: member.id,
      memberName: member.name,
      courseId: course.id,
      courseName: course.name,
      weekday,
      startTime,
      endTime,
      startDate,
      endDate,
      playerCount,
      isActive: true
    };

    if (editId) {
      updateCycleRule(editId, payload);
      Taro.showToast({ title: '已保存', icon: 'success' });
    } else {
      addCycleRule(payload);
      Taro.showToast({ title: '已新增周期规则', icon: 'success' });
    }
    setTimeout(() => {
      Taro.navigateBack();
    }, 800);
  };

  const handleGenerate = () => {
    if (!editId) {
      Taro.showToast({ title: '请先保存规则', icon: 'none' });
      return;
    }
    if (generateToDate < startDate) {
      Taro.showToast({ title: '生成日期不能早于规则开始日期', icon: 'none' });
      return;
    }
    if (generateToDate > endDate) {
      Taro.showModal({
        title: '提示',
        content: `生成截止日（${generateToDate}）超出规则有效期（至 ${endDate}），将最多生成到 ${endDate}，是否继续？`,
        success: (res) => {
          if (res.confirm) {
            doGenerate();
          }
        }
      });
      return;
    }
    doGenerate();
  };

  const doGenerate = () => {
    Taro.showModal({
      title: '生成未来预订',
      content: `将生成从今天到 ${generateToDate > endDate ? endDate : generateToDate} 的所有周期时段预订，确定继续吗？`,
      success: (res) => {
        if (res.confirm) {
          const result = generateBookingsFromCycle(editId, generateToDate);
          setGenerateResult(result);
          if (result.success > 0 && result.skipped.length === 0) {
            Taro.showToast({
              title: `成功生成 ${result.success} 条`,
              icon: 'success'
            });
          } else if (result.success > 0 && result.skipped.length > 0) {
            Taro.showToast({
              title: `成功 ${result.success} 条，跳过 ${result.skipped.length} 天`,
              icon: 'none',
              duration: 2500
            });
          } else if (result.total > 0) {
            Taro.showToast({
              title: '所选日期均已被占用',
              icon: 'none'
            });
          } else {
            Taro.showToast({
              title: '没有可生成的时段',
              icon: 'none'
            });
          }
        }
      }
    });
  };

  const member = members[memberIndex];
  const course = courses[courseIndex];

  return (
    <ScrollView scrollY className={styles.container}>
      <Text className={styles.sectionTitle}>基本信息</Text>
      <View className={styles.formCard}>
        <Picker mode="selector" range={members.map((m) => `${m.name}（${m.isVip ? 'VIP' : '普通'}）`)} value={memberIndex} onChange={(e) => setMemberIndex(Number(e.detail.value))}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>会员</Text>
            <View className={styles.formValue}>
              <Text>{member?.name}</Text>
              <Text className={styles.arrow}>›</Text>
            </View>
          </View>
        </Picker>

        <Picker mode="selector" range={courses.map((c) => c.name)} value={courseIndex} onChange={(e) => setCourseIndex(Number(e.detail.value))}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>球道</Text>
            <View className={styles.formValue}>
              <Text>{course?.name}</Text>
              <Text className={styles.arrow}>›</Text>
            </View>
          </View>
        </Picker>

        <Picker mode="selector" range={WEEKDAY_NAMES} value={weekday} onChange={(e) => setWeekday(Number(e.detail.value))}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>每周</Text>
            <View className={styles.formValue}>
              <Text>{WEEKDAY_NAMES[weekday]}</Text>
              <Text className={styles.arrow}>›</Text>
            </View>
          </View>
        </Picker>
      </View>

      <Text className={styles.sectionTitle}>打球时段</Text>
      <View className={styles.formCard}>
        <Picker mode="time" value={startTime} onChange={(e) => setStartTime(e.detail.value as string)}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>开始时间</Text>
            <View className={styles.formValue}>
              <Text>{startTime}</Text>
              <Text className={styles.arrow}>›</Text>
            </View>
          </View>
        </Picker>

        <Picker mode="time" value={endTime} onChange={(e) => setEndTime(e.detail.value as string)}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>结束时间</Text>
            <View className={styles.formValue}>
              <Text>{endTime}</Text>
              <Text className={styles.arrow}>›</Text>
            </View>
          </View>
        </Picker>

        <Picker mode="selector" range={PLAYER_OPTIONS} value={playerCount - 1} onChange={(e) => setPlayerCount(Number(e.detail.value) + 1)}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>打球人数</Text>
            <View className={styles.formValue}>
              <Text>{playerCount}人</Text>
              <Text className={styles.arrow}>›</Text>
            </View>
          </View>
        </Picker>
      </View>

      <Text className={styles.sectionTitle}>有效期</Text>
      <View className={styles.formCard}>
        <Picker mode="date" value={startDate} onChange={(e) => setStartDate(e.detail.value as string)}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>开始日期</Text>
            <View className={styles.formValue}>
              <Text>{startDate}</Text>
              <Text className={styles.arrow}>›</Text>
            </View>
          </View>
        </Picker>

        <Picker mode="date" value={endDate} onChange={(e) => setEndDate(e.detail.value as string)}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>结束日期</Text>
            <View className={styles.formValue}>
              <Text>{endDate}</Text>
              <Text className={styles.arrow}>›</Text>
            </View>
          </View>
        </Picker>
      </View>

      {editId && (
        <>
          <Text className={styles.sectionTitle}>批量生成预订</Text>
          <View className={styles.formCard}>
            <Picker mode="date" value={generateToDate} onChange={(e) => setGenerateToDate(e.detail.value as string)}>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>生成至</Text>
                <View className={styles.formValue}>
                  <Text>{generateToDate}</Text>
                  <Text className={styles.arrow}>›</Text>
                </View>
              </View>
            </Picker>
            <View className={styles.generateInfo}>
              <Text className={styles.generateInfoText}>
                将生成每周{WEEKDAY_NAMES[weekday]} {startTime}-{endTime} 的预订，时段冲突将自动跳过
              </Text>
            </View>
            <Button className={styles.generateBtn} onClick={handleGenerate}>
              生成未来预订
            </Button>

            {generateResult && generateResult.skipped.length > 0 && (
              <View className={styles.skippedList}>
                <Text className={styles.skippedTitle}>已跳过日期（球道已被占用）：</Text>
                <View className={styles.skippedTags}>
                  {generateResult.skipped.map((date, idx) => (
                    <View key={idx} className={styles.skippedTag}>
                      <Text>{date}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {generateResult && (
              <View className={styles.generateSummary}>
                <Text className={styles.generateSummaryText}>
                  总计 {generateResult.total} 个时段 · 成功生成 {generateResult.success} 条 · 跳过 {generateResult.skipped.length} 天
                </Text>
              </View>
            )}
          </View>
        </>
      )}

      <View className={styles.previewCard}>
        <Text className={styles.previewTitle}>规则预览</Text>
        <Text className={styles.previewText}>
          {member?.name} 每周{getWeekdayName(weekday)} {startTime}-{endTime}{'\n'}
          {course?.name} · {playerCount}人打球{'\n'}
          有效期：{startDate} 至 {endDate}
        </Text>
      </View>

      {error ? <Text className={styles.errorText}>{error}</Text> : null}

      <View className={styles.bottomBar}>
        <Button className={classnames(styles.submitBtn)} onClick={handleSave}>
          {editId ? '保存修改' : '创建周期规则'}
        </Button>
      </View>
    </ScrollView>
  );
};

export default CycleEditPage;
