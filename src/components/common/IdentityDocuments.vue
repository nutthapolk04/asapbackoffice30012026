<template>
  <div class="identity-documents">
    <div class="section-title" v-if="title">
      <el-icon><Document /></el-icon>
      {{ title }}
      <span class="doc-count" v-if="documents.length">({{ documents.length }} ไฟล์)</span>
    </div>

    <div class="documents-notice" v-if="notice">
      <el-icon><InfoFilled /></el-icon>
      {{ notice }}
    </div>

    <div class="documents-grid">
      <div
        class="document-card"
        v-for="(doc, index) in standardDocs"
        :key="index"
      >
        <div class="doc-header">
          <el-icon :size="20">
            <Picture v-if="isImage(doc.type)" />
            <Document v-else />
          </el-icon>
          <span class="doc-type">{{ doc.label }}</span>
        </div>
        <div class="doc-preview" @click="handlePreview(doc)">
          <el-image
            v-if="doc.url && isImage(doc.type)"
            :src="doc.url"
            fit="contain"
            :preview-src-list="[doc.url]"
            :initial-index="0"
            preview-teleported
          >
            <template #error>
              <div class="image-placeholder">
                <el-icon><Picture /></el-icon>
                <span>ไม่สามารถโหลดรูปได้</span>
              </div>
            </template>
          </el-image>
          <div v-else-if="doc.url" class="file-preview">
            <el-icon :size="48"><Document /></el-icon>
            <span>{{ doc.fileName }}</span>
          </div>
          <div v-else class="empty-preview">
            <el-icon :size="32" v-if="editable"><Plus /></el-icon>
            <el-icon :size="32" v-else><Picture /></el-icon>
            <span>{{ editable ? 'คลิกเพื่ออัปโหลด' : 'ยังไม่มีข้อมูล' }}</span>
          </div>
        </div>
        <div class="doc-actions" v-if="doc.url">
          <el-button size="small" @click="handleView(doc)">
            <el-icon><ZoomIn /></el-icon>
            <span style="margin-left: 6px;">ดูขนาดเต็ม</span>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Document,
  Picture,
  ZoomIn,
  Download,
  InfoFilled,
  Plus
} from '@element-plus/icons-vue'

const props = defineProps({
  title: {
    type: String,
    default: 'เอกสารที่แนบมา'
  },
  notice: {
    type: String,
    default: ''
  },
  documents: {
    type: Array,
    default: () => []
  },
  editable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['preview', 'view', 'download', 'upload'])

const standardDocs = computed(() => {
  const defaultTypes = [
    { label: 'สำเนาบัตรประชาชน', key: 'id_card' },
    { label: 'สำเนาใบขับขี่', key: 'driving_license' },
    { label: 'สำเนาหนังสือเดินทาง', key: 'passport' }
  ]

  return defaultTypes.map(type => {
    const existing = props.documents.find(d => d.label === type.label)
    return existing || {
      label: type.label,
      url: '',
      type: 'image/jpeg',
      fileName: ''
    }
  })
})

const isImage = (type) => {
  return ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'jpg', 'png', 'gif', 'webp'].includes(type?.toLowerCase())
}

const handlePreview = (doc) => {
  if (props.editable && !doc.url) {
    emit('upload', doc)
  } else {
    emit('preview', doc)
  }
}

const handleView = (doc) => {
  emit('view', doc)
}

const handleDownload = (doc) => {
  emit('download', doc)
}
</script>

<style lang="scss" scoped>
.identity-documents {
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #333;

    .doc-count {
      font-size: 14px;
      font-weight: normal;
      color: #666;
    }
  }

  .documents-notice {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #FEF0C7;
    color: #B54708;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 14px;
  }

  .documents-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }

  .document-card {
    border: 1px solid #E4E7EC;
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .doc-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #F9FAFB;
      border-bottom: 1px solid #E4E7EC;

      .doc-type {
        font-weight: 500;
        color: #333;
      }
    }

    .doc-preview {
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F3F4F6;
      cursor: pointer;
      position: relative;

      .el-image {
        width: 100%;
        height: 100%;
      }

      .image-placeholder,
      .file-preview,
      .empty-preview {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: #666;
        text-align: center;
        padding: 20px;
      }

      .empty-preview {
        color: #98A2B3;
        
        .el-icon {
          margin-bottom: 4px;
        }
      }
    }

    .doc-actions {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      background: #fff;
      border-top: 1px solid #E4E7EC;

      :deep(.el-button) {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex: 1;

        .el-icon {
          margin: 0;
        }
      }
    }
  }
}
</style>
